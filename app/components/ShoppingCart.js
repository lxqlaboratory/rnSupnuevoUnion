/**
 * ShoppingCart.js
 */

import React, {Component} from 'react';
import {ScrollView, View,StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import colors from '../resources/colors';
import { SCREEN_WIDTH} from '../utils/tools';
import {Badge} from "react-native-elements";
import SwipeableView from "./SwipeableView";
import constants from '../resources/constants';

export default class ShoppingCart extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state={
    }
  }

  render() {
    const cartInfo = this.props.cartInfo;
    return(
        <View style={styles.container}>
        <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            contentContainerStyle = {styles.centerContainer}
        >
          {this._renderCartItems(cartInfo)}
        </ScrollView>
        </View>
    )
  }

  _renderCartItems(cartInfo){
    if(!cartInfo || cartInfo.length === 0)return;
    var cartItemList = [];
    cartInfo.map((item,i)=>{
      const image = item.image && item.image!==undefined?{uri:item.image}:require('../assets/img/img_logo.png')
      cartItemList.push
      (
          <SwipeableView swipeableStyle={styles.picStyle}
                         onDownSwipe={()=>this.props._onUpdateCartCommodity(constants.CART_DECLINE, item, i)}
                         onUpSwipe={()=>this.props._onUpdateCartCommodity(constants.CART_ADD, item, i)}>
            <Badge value={item.amount} status="error" containerStyle={{ position: 'absolute', top: -5, right: -5 }}/>
            <Image resizeMode="contain" style={{width: 100, height: 80,}} source={image}/>
          </SwipeableView>
      );
    });
    return cartItemList;
  };

}

var styles = StyleSheet.create({
  container:{
    height:140,
    width:SCREEN_WIDTH,
  },
  IconContainerStyle:{
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainerStyle:{
    flex:1,
    justifyContent:'flex-start',
    alignItems: 'center',
  },
  textStyle:{
    color:'#fff',
    fontSize:18
  },
  picStyle: {
    width: 100,
    height: 80,
    margin:10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.8,
    borderColor: colors.primaryGrayLight,
  },
  centerContainer:{
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

