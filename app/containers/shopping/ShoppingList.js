/**
 * DataForm.js
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
import {BottomToolBar} from "../../components/BottomToolBar";
import {Avatar, Badge, ListItem} from "react-native-elements";
import colors from "../../resources/colors";
import {getHeaderHeight, replaceMember, SCREEN_WIDTH, showCenterToast} from "../../utils/tools";
import ShoppingCart from "../../components/ShoppingCart";
import {AISearchBar} from "../../components/AIServer";
import IntroDivider from "../../components/IntroDivider";
import constants from "../../resources/constants";
import * as shoppingActions from '../../actions/shopping-actions';
import * as unionActions from '../../actions/union-actions';
import * as rootActions from "../../actions/root-actions";
import strings from "../../resources/strings";
import {SpinnerWrapper} from "../../components/SpinnerLoading";
import NetworkingError from "../union/UnionPrice";
import RefreshListView from "../../components/RefreshListView";

const count = constants.PRICE_LIST_PAGE;

export class ShoppingList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            start: 1,
            searchText: '',
            searchResult: [],
            selectedPrice: null,
            isSearchStatus: false,
        };
    }

    componentDidMount() {
        this.props.dispatch(rootActions.setLoading(false));
        this.props.dispatch(unionActions.getUnionPriceList(this.props.unionId, 0, count));
        this.props.dispatch(shoppingActions.getCartInfo(this.props.cartId));
    }

    componentWillReceiveProps(nextProps) {
        const unionResponse = this.props.union.get('dataResponse');
        const nextUnionResponse = nextProps.union.get('dataResponse');

        const shoppingResponse = this.props.shopping.get('dataResponse');
        const nextShoppingResponse = nextProps.shopping.get('dataResponse');

        // 搜索引擎
        if (unionResponse === constants.INITIAL && nextUnionResponse === constants.GET_PRICE_LIST_LUCENE_SUCCESS) {
            this.props.dispatch(unionActions.resetUnionResponse());
        }else if (unionResponse === constants.INITIAL && nextUnionResponse === constants.GET_PRICE_LIST_LUCENE_FAIL){
            showCenterToast(strings.getUnionPriceListLuceneFail);
            this.props.dispatch(unionActions.resetUnionResponse());
        }
        // 获取购物车信息
        if (shoppingResponse === constants.INITIAL && nextShoppingResponse === constants.GET_CART_INFO_SUCCESS) {
            this.props.dispatch(shoppingActions.resetShoppingResponse());
        }else if (shoppingResponse === constants.INITIAL && nextShoppingResponse === constants.GET_CART_INFO_FAIL){
            showCenterToast(strings.getCartInfoFail);
            this.props.dispatch(shoppingActions.resetShoppingResponse());
        }
        // 更改购物车信息
        if (shoppingResponse === constants.INITIAL && nextShoppingResponse === constants.UPDATE_CART_INFO_SUCCESS) {
            this.props.dispatch(shoppingActions.resetShoppingResponse());
        }else if (shoppingResponse === constants.INITIAL && nextShoppingResponse === constants.UPDATE_CART_INFO_FAIL){
            showCenterToast(strings.updateCartInfoFail);
            this.props.dispatch(shoppingActions.resetShoppingResponse());
        }
    }

    onHeaderRefresh = () => {
        if(this.state.isSearchStatus)return;

        this.props.dispatch(unionActions.getUnionPriceList(this.props.unionId, 0, count));
        this.setState({start: 1});
    };

    onFooterRefresh = () => {
        if(this.state.isSearchStatus)return;

        let curStart = this.state.start + 1;
        this.props.dispatch(unionActions.getUnionPriceList(this.props.unionId, this.state.searchText, curStart, count));
        this.setState({start: curStart});
    };

    render() {
        const loading = this.props.root.get('loading');
        const {cartInfo} = this.props;
        const cartNumber = cartInfo && cartInfo.length>0?cartInfo.length:0;

        return (
            <View style={styles.container}>
                <TopToolBar title = "购物" navigation = {this.props.navigation}
                            _onLeftIconPress={this._onVolumeIconPress}
                            _onRightIconPress={this._onHelpIconPress}/>
                <IntroDivider intro={"您的购物车共有"+cartNumber+"件商品"} />
                {this._renderShoppingCart(cartInfo)}
                {this._renderSearchBar()}
                {this._renderPriceList()}
                <BottomToolBar navigation = {this.props.navigation}/>
                <SpinnerWrapper loading={loading} title={'搜索中,请稍候...'}/>
            </View>
        );
    }

    _renderShoppingCart(cartInfo){

        return(
            <ShoppingCart
                cartInfo={cartInfo}
                _onUpdateCartCommodity={(type, item, i)=>this._onUpdateCartCommodity(type, item, i)}
            />
        );
    }

    _renderSearchBar() {
        return (
            <AISearchBar
                _onMicrophonePress={this._onMicrophonePress}
                _searchTextChange={(text) => this._searchTextChange(text)}
                _onSearchPress={this._onSearchPress}
                searchResult={this.state.searchResult}
                searchText={this.state.searchText}
            />
        );
    }

    _renderPriceList() {
        const prices = this.props.union.get("priceList");
        const datasError = this.props.union.get('datasError');
        const refreshState = this.props.union.get('refreshState');

        const priceList = prices && prices.length > 0 ? prices : [];

        return (
            datasError ?
                <NetworkingError
                    retry={() => this.props.dispatch(unionActions.getUnionPriceList(this.props.unionId, 0, count))}/>
                :
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : null}
                                      keyboardVerticalOffset={getHeaderHeight} style={styles.container}>
                    <SafeAreaView style={styles.container}>
                        <RefreshListView
                            data={priceList}
                            footerEmptyDataText={strings.noData}
                            footerFailureText={strings.loadError}
                            footerNoMoreDataText={strings.noMore}
                            footerRefreshingText={strings.loading}
                            ItemSeparatorComponent={() => <View style={styles.separator}/>}
                            keyExtractor={(item, index) => `${index}`}
                            onFooterRefresh={this.onFooterRefresh}
                            onHeaderRefresh={this.onHeaderRefresh}
                            refreshState={refreshState}
                            renderItem={this.renderCell}
                            style={styles.listView}
                        />
                    </SafeAreaView>
                </KeyboardAvoidingView>
        );
    }

    renderCell = ({item, index}) => {
        const priceList = this.props.union.get('priceList');
        const price = priceList[index];

        return (
            <ListItem
                title={price.nombre}
                subtitle={price.codigo}
                rightTitle={price.price}
                style={styles.listItemStyle}
                subtitleStyle={styles.subtitleText}
                rightTitleStyle={styles.rightTitle}
                onPress={() => this._onPriceListCommodityPress(price,index)}
            />
        );
    }

    _onVolumeIconPress =() =>{};

    _onHelpIconPress =() =>{};

    _onMicrophonePress = ()=>{};

    _onUpdateCartCommodity = (type, item, i) => this.props.dispatch(shoppingActions.updateCartInfo(this._transFromPriceToCartInfo(item, type), this.props.unionId));

    _searchTextChange = (text) => {
        this.setState({searchText: text});
        if (!text) {
            this._clearSearchInput()
            return;
        }
    };

    _clearSearchInput = () => this.setState({searchText: ''})

    _onSearchPress = () => {
        this.setState({isSearchStatus: true});
        this.props.dispatch(unionActions.getUnionPriceListLucene(this.props.unionId, this.state.searchText));
    };

    _onPriceListCommodityPress = (price, index) => this.props.dispatch(shoppingActions.updateCartInfo(this._transFromPriceToCartInfo(price, constants.CART_CREATE), this.props.unionId))

    _transFromPriceToCartInfo(price, type){
        var amount =1;
        switch (type) {
            case constants.CART_CREATE:amount=1;break;
            case constants.CART_ADD:amount=price.amount+1;break;
            case constants.CART_DECLINE:amount=price.amount-1;break;
        }
        const carInfo = {itemId: price.itemId, commodityId: price.commodityId, amount: amount};
        return carInfo;
    }

};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent:'center',
        alignItems: 'center',
    },
    listViewWrapper:{
        width:SCREEN_WIDTH,
        flex:1,
    },
    listView:{
        flex:1,
        marginBottom: 40,
    },
    listItemStyle:{
        flex:1,
        width:SCREEN_WIDTH,
        borderBottomWidth: 0.8,
        borderColor: colors.saperatorLine,
    },
    image:{
        width:90,
        height:60,
    },
    subtitleText:{
        fontSize:16,
        color: colors.brightRed,
        marginTop:10,
    }
});

const mapStateToProps = (state) => ({
    auth: state.get('auth'),
    root: state.get('root'),
    union: state.get("union"),
    unionId: state.get('auth').get("unionId"),
    cartId: state.get("auth").get("cartId"),
    shopping: state.get('shopping'),
    cartInfo: state.get('shopping').get("cartInfo"),
});

export default connect(mapStateToProps)(ShoppingList)
