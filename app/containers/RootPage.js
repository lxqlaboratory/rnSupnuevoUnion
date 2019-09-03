/**
 * RootPage.js
 */

import React, {Component} from "react";
import {Image, StatusBar, StyleSheet, Text, View} from "react-native";
import {connect} from "react-redux";
import {TopToolBar} from '../components/TopToolBar';
import {BottomToolBar, ACTION_BACK, ACTION_DISCOUNT} from '../components/BottomToolBar';
import constants from '../resources/constants';
import Button from "../components/Button";

export class RootPage extends Component {

    constructor(props) {
        super(props);
        this.state={
        };
    }

  render() {
    const navigator = this.props.navigation;

    return (
        <View style={styles.container}>
            <TopToolBar title = "首页" navigation = {this.props.navigation}
                        _onLeftIconPress={this._onVolumeIconPress}
                        _onRightIconPress={this._onHelpIconPress}/>
                <View style={styles.buttonWrapper}><Button title={'逛店/选择我的超市'} onPress={()=>navigator.push('UnionStack')}/></View>
                <View style={styles.buttonWrapper}><Button title={'购物'} onPress={()=>navigator.push('ShoppingStack')}/></View>
                <View style={styles.buttonWrapper}><Button title={'下订单/我的订单'} onPress={()=>navigator.push('OrderStack')}/></View>
            <BottomToolBar navigation = {this.props.navigation}/>
        </View>
    );
  }

    _onVolumeIconPress =() =>{};
    _onHelpIconPress =() =>{};

};

const styles = StyleSheet.create({
    container: {
        flex:1,
        alignItems:'center',
        justifyContent: 'center'
    },
    buttonWrapper:{
        flex:1,
        alignItems:'center',
        justifyContent: 'center'
    }
});

const mapStateToProps = (state) => ({
    auth: state.get('auth'),
    root: state.get('root'),
});

export default connect(mapStateToProps)(RootPage)
