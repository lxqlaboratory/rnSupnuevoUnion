/**
 * UnionDiscount.js
 */

// 组件
import React, {Component} from "react";
import {
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    ScrollView,
    ListView
} from "react-native";
import {connect} from "react-redux";
import {TopToolBar} from "../../components/TopToolBar";
import {BottomToolBar, ACTION_BACK} from "../../components/BottomToolBar";
import {
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
    getHeaderHeight,
    showCenterToast,
    transFromOrderItemToArray
} from "../../utils/tools";
import {InputWithCalendar} from '../../components/multiFuncTextInput/index';
import strings from "../../resources/strings";
import TableView from "../../components/TableView";
import constants from "../../resources/constants";
import colors from "../../resources/colors";
import {OrderDropdownCell} from "../../components/modalDropdownBar";
import {InformationItem, TYPE_TEXT} from "../../components/InformationItem";
import * as orderActions from "../../actions/order-actions";
import * as authActions from "../../actions/auth-actions";
import IntroDivider from "../../components/IntroDivider";

export class OrderHistory extends Component {

  constructor(props) {
    super(props);
      this.state = {
          orderDate:'请输入订单日期',
      };
  }

    componentDidMount() {
        this.props.dispatch(orderActions.getOrderListOfDate(null));
    }

    componentWillReceiveProps(nextProps) {
        const orderResponse = this.props.order.get('dataResponse');
        const nextOrderResponse = nextProps.order.get('dataResponse');

        // 获取历史订单
        if (orderResponse === constants.INITIAL && nextOrderResponse === constants.GET_ORDER_LIST_SUCCESS) {
            this.props.dispatch(orderActions.resetOrderResponse());
        } else if (orderResponse === constants.INITIAL && nextOrderResponse === constants.GET_ORDER_LIST_FAIL) {
            showCenterToast(strings.getOrderListFail);
            this.props.dispatch(orderActions.resetOrderResponse());
        }
    }

  render() {
      const orderList = this.props.order.get('orderList');
      const orderListView = [];
      orderList.map((orderItem,i)=>{
          orderListView.push(this._renderOrderItem(orderItem));
      });

      return (
          <View style={styles.container}>
              <TopToolBar title = "历史订单" navigation = {this.props.navigation}
                          _onLeftIconPress={this._onVolumeIconPress}
                          _onRightIconPress={this._onHelpIconPress}/>
              <ScrollView>
              <View style={styles.scrollViewContanier}>
              <InputWithCalendar
                  title={strings.orderDate}
                  date={this.state.orderDate}
                  onDateChange={(value)=>{
                      this.setState({orderDate:value});
                      this.props.dispatch(orderActions.getOrderListOfDate(value));
                  }}/>
                  {orderListView}
              </View>
              </ScrollView>
              <BottomToolBar navigation = {this.props.navigation}
              leftAction={ACTION_BACK} _onLeftIconPress={this._onBackIconPress}/>
          </View>);
  }

  _renderOrderItem(orderItem){
      const order = orderItem.order;
      const itemList = order.itemList;
      let orderView = this._renderBasicInfo(order);
      let itemView = this._renderOrderItemInfo(itemList);
      let divider = <IntroDivider dividerStyle={{marginTop: 10}} intro={strings.orderNum+": "+order.orderNum}/>;
      return ([divider,orderView,itemView]);
  }

    _renderBasicInfo(order){
        return(
            order?
            <View style={styles.basicInfoContainer}>
                <InformationItem key = {0} type = {TYPE_TEXT} title = {strings.customerMobilePhone} content = {order.receiverPhone}/>
                <InformationItem key = {1} type = {TYPE_TEXT} title = {strings.deliverMobilePhone} content = {order.nomroDetelePhono}/>
                <InformationItem key = {2} type = {TYPE_TEXT} title = {strings.deliverAddress} content = {order.direccion}/>
                <InformationItem key = {3} type = {TYPE_TEXT} title = {strings.pickMobilePhone} content = {order.receiverPhone}/>
                <InformationItem key = {4} type = {TYPE_TEXT} title = {strings.pickName} content = {order.receiverName}/>
            </View>:null
        );
  }

    _renderOrderItemInfo(itemList){
        var itemArray = [];
        if(itemList && itemList.length>0)
            itemList.map((item,i)=>{itemArray.push(transFromOrderItemToArray(item))});

        return(
            itemList && itemList.length>0?
            <View style={styles.tableInfoCard}>
                <TableView title={strings.orderInfo} headerList={constants.cartHeaderList} dataList={itemArray} renderAux={null}/>
            </View>:null
        );
    }

  _onVolumeIconPress =() =>{};

  _onHelpIconPress =() =>{};

  _onBackIconPress=() =>this.props.navigation.pop();
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: SCREEN_WIDTH,
    },
    basicInfoContainer:{
        flex:1,
        width: SCREEN_WIDTH,
    },
    scrollViewContanier:{
        alignItems: 'center',
        marginBottom: 100,
    },
    tableInfoCard:{
        width:SCREEN_WIDTH-40,
        flex:1,
        borderColor:colors.primaryGray,
        borderWidth:1,
        borderRadius:10,
        marginTop: 10,
    },
});

const mapStateToProps = (state) => ({
    auth: state.get('auth'),
    root: state.get('root'),
    order: state.get('order'),
});

export default connect(mapStateToProps)(OrderHistory)
