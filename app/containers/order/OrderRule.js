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
import {SCREEN_HEIGHT, SCREEN_WIDTH, getHeaderHeight, showCenterToast} from "../../utils/tools";
import constants from '../../resources/constants';
import * as orderActions from "../../actions/order-actions";
import * as unionActions from '../../actions/union-actions';
import strings from "../../resources/strings";

export class OrderRule extends Component {

  constructor(props) {
    super(props);
      this.state = {};
  }

    componentDidMount() {
        this.props.dispatch(unionActions.getUnionRegulation(this.props.unionId));
    }

    componentWillReceiveProps(nextProps) {
        const response = this.props.union.get('dataResponse');
        const nextResponse = nextProps.union.get('dataResponse');

        if (response === constants.INITIAL && nextResponse === constants.GET_UNION_REGULATION_SUCCESS) {
            this.props.dispatch(unionActions.resetUnionResponse());
        } else if (response === constants.INITIAL && nextResponse === constants.GET_UNION_REGULATION_FAIL) {
            showCenterToast(strings.getUnionRegulationFail);
            this.props.dispatch(unionActions.resetUnionResponse());
        }
    }

  render() {
      const regulation = this.props.union.get("regulation");
      return (
          <View style={styles.container}>
              <TopToolBar title = "本店规则" navigation = {this.props.navigation}
                          _onLeftIconPress={this._onVolumeIconPress}
                          _onRightIconPress={this._onHelpIconPress}/>
              {this._renderRulePage(regulation)}
              <BottomToolBar navigation = {this.props.navigation}
              leftAction={ACTION_BACK} _onLeftIconPress={this._onBackIconPress}/>
          </View>
      );
  }

    _renderRulePage(regulation){
      return(
          <View style={styles.container}>
          <ScrollView>
              <View style={styles.scrollViewWrapper}>
              <Text style={styles.ruleText}>{regulation}</Text>
              </View>
          </ScrollView>
          </View>
      );
  }

  _onVolumeIconPress =() =>{};

  _onHelpIconPress =() =>{};

    _onBackIconPress=() =>this.props.navigation.pop();
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollViewWrapper:{
        flex:1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    ruleText:{
        flex:1,
        textAlign:'center',
        fontSize:16,
        marginTop:20,
    }
});

const mapStateToProps = (state) => ({
    auth: state.get('auth'),
    root: state.get('root'),
    union: state.get("union"),
    unionId: state.get("union").get("union").unionId,
});

export default connect(mapStateToProps)(OrderRule)
