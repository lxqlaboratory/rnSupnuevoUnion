/**
 * OrderCommit.js
 */

// 组件
import React, {Component} from "react";
import {Image, StatusBar, Text, TouchableOpacity, View, Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, ScrollView} from "react-native";
import {
    isEmptyObject,
    isObject,
    getHeaderHeight,
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    showCenterToast
} from "../../utils/tools";
import {connect} from "react-redux";
import {TopToolBar} from "../../components/TopToolBar";
import {ACTION_BACK, BottomToolBar,ACTION_HISTORY,ACTION_RULE} from "../../components/BottomToolBar";
import {InformationItem,TYPE_TEXT} from "../../components/InformationItem";
import {Button, CheckBox} from "react-native-elements";
import {DropdownCell, OrderDropdownCell} from "../../components/modalDropdownBar/index";
import colors from '../../resources/colors'
import strings from "../../resources/strings";
import constants from "../../resources/constants";
import TableView from "../../components/TableView";
import * as orderActions from "../../actions/order-actions";
import * as authActions from "../../actions/auth-actions";
import {transFromOrderItemToArray, transFromDiscountItemToArray, toDecimal2} from '../../utils/tools';
import Modal from "react-native-modalbox";
import {InputWithClearButton, InputWithActionSheet, InputWithCalendar} from '../../components/multiFuncTextInput/index'

let receiverNameList = [];
let receiverPhoneList = [];
let receiverAddrList = [];

export class OrderCommit extends Component {

    constructor(props) {
        super(props);
        this.state = {
            deliveryInfo: {receiverName:'',receiverPhone:'',receiverAddr:'',deliveryType:constants.SELF_DELIVERY},
            deliveryAddType: constants.ADDR_TYPE,
            deliveryTextInput: "",
        };
    }

    componentDidMount() {
        this.props.dispatch(orderActions.getOrderPrevInfo());
    }

    componentWillReceiveProps(nextProps) {
        const orderResponse = this.props.order.get('dataResponse');
        const nextOrderResponse = nextProps.order.get('dataResponse');

        const authResponse = this.props.auth.get("dataResponse");
        const nextAuthResponse = nextProps.auth.get("dataResponse");

        // 获取当前订单
        if (orderResponse === constants.INITIAL && nextOrderResponse === constants.GET_PREV_ORDER_SUCCESS) {
            this.props.dispatch(orderActions.resetOrderResponse());
        }else if (orderResponse === constants.INITIAL && nextOrderResponse === constants.GET_PREV_ORDER_FAIL){
            showCenterToast(strings.getPrevOrderFail);
            this.props.dispatch(orderActions.resetOrderResponse());
        }
        // 提交订单
        if (orderResponse === constants.INITIAL && nextOrderResponse === constants.SUBMIT_ORDER_INFO_SUCCESS) {
            showCenterToast(strings.submitOrderSuccess);
            this.props.dispatch(orderActions.resetOrderResponse());
        }else if (orderResponse === constants.INITIAL && nextOrderResponse === constants.SUBMIT_ORDER_INFO_FAIL){
            showCenterToast(strings.submitOrderFail);
            this.props.dispatch(orderActions.resetOrderResponse());
        }
        // 添加配送信息
        if (authResponse === constants.INITIAL && nextAuthResponse === constants.ADD_RECEIVER_INFO_SUCCESS) {
            this.props.dispatch(authActions.resetAuthResponse());
            this.refs.modal.close();
        }else if (authResponse === constants.INITIAL && nextAuthResponse === constants.ADD_RECEIVER_INFO_FAIL){
            showCenterToast(strings.addCustomerReceiverInfoFail);
            this.props.dispatch(authActions.resetAuthResponse());
        }
    }

    render() {
        const orderItemList = this.props.order.get("orderItemList");
        const discountItemList = this.props.order.get("discountItemList");
        const totalFee = this.props.order.get("totalFee");
        const discountFee = this.props.order.get("discountFee");
        const totalFeeFinal = this.props.order.get("totalFeeFinal");

        this._getDeliverInfo();

        return (
            <View style={styles.container}>
                <TopToolBar title = "订单" navigation = {this.props.navigation}
                            _onLeftIconPress={this._onVolumeIconPress}
                            _onRightIconPress={this._onHelpIconPress}/>
                <ScrollView style={styles.scrollView}>
                    <View style={styles.scrollViewContanier}>
                        {this._renderBasicInfo()}
                        {this._renderDeliverInfo()}
                        {this._renderCartInfo(orderItemList, totalFee)}
                        {this._renderDiscountInfo(discountItemList, discountFee, totalFeeFinal)}
                        {this._renderCommitButton()}
                    </View>
                </ScrollView>
                {this._renderModal()}
                <BottomToolBar navigation = {this.props.navigation}
                               leftAction={ACTION_HISTORY}
                               _onLeftIconPress={this._onHistoryIconPress}
                               rightAction={ACTION_RULE}
                               _onRightIconPress={this._onRuleIconPress}
                />
            </View>
        );
    }

    _renderBasicInfo(){
        const customerInfo = this.props.auth.get("customerInfo");
        const merchant = this.props.union.get("merchant");

        return(
            <View style={styles.basicInfoContainer}>
                <InformationItem key = {0} type = {TYPE_TEXT} title = {strings.customerMobilePhone} content = {customerInfo.receiverPhones}/>
                <InformationItem key = {1} type = {TYPE_TEXT} title = {strings.deliverMobilePhone} content = {merchant?merchant.cuit:''}/>
                <InformationItem key = {2} type = {TYPE_TEXT} title = {strings.deliverAddress} content = {merchant?merchant.direccion:''}/>
            </View>
        );
    }

    _renderDeliverInfo(){
        var {deliveryType} = this.state.deliveryInfo;
        return(
            <View style={styles.deliverInfoCard}>
                <CheckBox title={strings.self_delivery} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' checked={deliveryType === constants.SELF_DELIVERY} onPress={() => this.setState({deliveryInfo:Object.assign(this.state.deliveryInfo,{deliveryType: constants.SELF_DELIVERY})})}/>
                <CheckBox title={strings.common_delivery} checkedIcon='dot-circle-o' uncheckedIcon='circle-o' checked={deliveryType === constants.COMMON_DELIVERY} onPress={() => this.setState({deliveryInfo:Object.assign(this.state.deliveryInfo,{deliveryType: constants.COMMON_DELIVERY})})}/>
                <OrderDropdownCell defaultValue={strings.receiverAddr_input} dataList={receiverAddrList} onDropDownSelect={this._onReceiverAddrSelect} onButtonPress={this._onReceiverAddrPress}/>
                <OrderDropdownCell defaultValue={strings.receiverPhone_input} dataList={receiverPhoneList} onDropDownSelect={this._onReceiverPhoneSelect} onButtonPress={this._onReceiverPhonePress}/>
                <OrderDropdownCell defaultValue={strings.receiverName_input} dataList={receiverNameList} onDropDownSelect={this._onReceiverNameSelect} onButtonPress={this._onReceiverNamePress}/>
            </View>
        );
    }

    _renderCartInfo(orderItemList, totalFee){
        var orderItemArray = [];
        if(orderItemList && orderItemList.length>0)
            orderItemList.map((orderItem,i)=>{orderItemArray.push(transFromOrderItemToArray(orderItem))});

        return(
            <View style={styles.tableInfoCard}>
                <TableView title={strings.cartInfo} headerList={constants.cartHeaderList} dataList={orderItemArray} renderAux={()=>this._renderCartAux(totalFee)}/>
            </View>
        );
    }

    _renderCartAux(totalFee){
        return(
            <View style={styles.auxContainerStyle}>
                <Text style={styles.auxTextStyle}>Total: {toDecimal2(totalFee)}</Text>
            </View>
        );
    }

    _renderDiscountInfo(discountItemList, discountFee, totalFeeFinal){
        var discountItemArray = [];
        if(discountItemList && discountItemList.length>0)
            discountItemList.map((discountItem,i)=>{discountItemArray.push(transFromDiscountItemToArray(discountItem))});

        return(
            <View style={styles.tableInfoCard}>
                <TableView title={strings.discountInfo} headerList={constants.discountHeaderList} dataList={discountItemArray} renderAux={()=>this._renderDiscountAux(discountFee, totalFeeFinal)}/>
            </View>
        );
    }

    _renderDiscountAux(discountFee, totalFeeFianl){
        return(
            <View style={styles.auxContainerStyle}>
                <Text style={styles.auxTextStyle}>{strings.discountFee}: {toDecimal2(discountFee)}</Text>
                <Text style={[styles.auxTextStyle,{marginTop:10}]}>{strings.totalFeeFianl}: {toDecimal2(totalFeeFianl)}</Text>
            </View>
        )
    }

    _renderCommitButton(){
        return(
            <View style={styles.commitBtnWrapper}>
                <Button title={strings.commit} buttonStyle={styles.commitBtn} onPress={this._onCommitPress}/>
            </View>
        )
    };

    _renderModal(){
        const deliveryAddType  = this.state.deliveryAddType;
        var placeholder = "";

        switch (deliveryAddType) {
            case constants.NAME_TYPE:placeholder = strings.receiverName_input;break;
            case constants.PHONE_TYPE:placeholder = strings.receiverPhone_input;break;
            case constants.ADDR_TYPE:placeholder = strings.receiverAddr_input;break;
        }

        return(
            <Modal style={styles.modalbox} position={"center"} ref={"modal"}>
                <InputWithClearButton
                    hookCanBeCleared
                    textInputEvent={{
                        placeholder: placeholder,
                        onChangeText: (value) => {
                            switch (deliveryAddType) {
                                case constants.NAME_TYPE:this.setState({deliveryInfo:Object.assign(this.state.deliveryInfo,{receiverName: value}),deliveryTextInput:value});break;
                                case constants.PHONE_TYPE:this.setState({deliveryInfo:Object.assign(this.state.deliveryInfo,{receiverPhone: value}),deliveryTextInput:value});break;
                                case constants.ADDR_TYPE:this.setState({deliveryInfo:Object.assign(this.state.deliveryInfo,{receiverAddr: value}),deliveryTextInput:value});break;
                            }
                        }}}
                />
                <Button title={strings.add} buttonStyle={styles.addBtn} onPress={()=>this.props.dispatch(authActions.addReceiverInfo(deliveryAddType, this.state.deliveryTextInput))}/>
            </Modal>
        );
    }

    _onReceiverAddrSelect = (idx, value) => this.setState({deliveryInfo:Object.assign(this.state.deliveryInfo,{receiverAddr: value})});

    _onReceiverPhoneSelect = (idx, value) => this.setState({deliveryInfo:Object.assign(this.state.deliveryInfo,{receiverPhone: value})});

    _onReceiverNameSelect = (idx, value) => this.setState({deliveryInfo:Object.assign(this.state.deliveryInfo,{receiverName: value})});

    _onReceiverAddrPress = () => {this.setState({deliveryAddType:constants.ADDR_TYPE});this.refs.modal.open()};

    _onReceiverPhonePress = () => {this.setState({deliveryAddType:constants.PHONE_TYPE});this.refs.modal.open()};

    _onReceiverNamePress = () => {this.setState({deliveryAddType:constants.NAME_TYPE});this.refs.modal.open()};

    _onCommitPress = () => {this.props.dispatch(orderActions.submitOrder(this.state.deliveryInfo))};

    _onHistoryIconPress =() =>{this.props.navigation.push("OrderHistory");};

    _onRuleIconPress =()=>{this.props.navigation.push("OrderRule");};

    _getDeliverInfo(){
        var {customerInfo} = this.props;
        receiverNameList = customerInfo.receiverNames?customerInfo.receiverNames.split(','):[];
        receiverPhoneList = customerInfo.receiverPhones?customerInfo.receiverPhones.split(','):[];
        receiverAddrList = customerInfo.receiverAddrs?customerInfo.receiverAddrs.split(','):[];
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
    },
    scrollView:{
        marginBottom: getHeaderHeight(),
    },
    scrollViewContanier:{
        alignItems: 'center',

    },
    basicInfoContainer:{
        flex:1
    },
    deliverInfoCard:{
        width:SCREEN_WIDTH-40,
        flex:1,
        borderColor:colors.primaryGray,
        borderWidth:1,
        borderRadius:10,
        marginTop: 10,
    },
    tableInfoCard:{
        width:SCREEN_WIDTH-40,
        flex:1,
        borderColor:colors.primaryGray,
        borderWidth:1,
        borderRadius:10,
        marginTop: 10,
    },
    auxContainerStyle:{
        flex:1,
        width:"100%",
        justifyContent:'flex-end',
        padding:5,
        flexDirection: 'column'
    },
    auxTextStyle:{
        flex:1,
        textAlign: 'right'
    },
    commitBtnWrapper:{
        width:SCREEN_WIDTH,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center'
    },
    commitBtn: {
        width:200,
        backgroundColor:colors.primaryColor
    },
    addBtn: {
        width:200,
        marginTop:50,
        backgroundColor:colors.primaryColor
    },
    modalbox:{
        justifyContent:'center',
        alignItems:'center',
        height:300,
        width:SCREEN_WIDTH,
    }
});

const mapStateToProps = (state) => ({
    auth: state.get('auth'),
    root: state.get('root'),
    union: state.get('union'),
    order: state.get('order'),
    customerInfo: state.get("auth").get("customerInfo"),
});

export default connect(mapStateToProps)(OrderCommit)
