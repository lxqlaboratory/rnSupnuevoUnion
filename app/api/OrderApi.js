/**
 * OrderApi.js
 */

import constants from "../resources/constants";
import {post} from '../utils/httpUtils'

// 提交订单
export function submitSupnuevoCustomerOrder(deliveryInfo) {
  const url = constants.SUPNUEVO_TEST_BASE_URL + '/func/customer/submitSupnuevoCustomerOrder';
  const body = {
    deliveryType:deliveryInfo.deliveryType,
    receiverAddr:deliveryInfo.receiverAddr,
    receiverName:deliveryInfo.receiverName,
    receiverPhone:deliveryInfo.receiverPhone,
    submitMode:"1",
  };

  return post(url ,body);
}

// 获取当前订单信息
export function getSupnuevoCustomerOrderPrevInfo() {
  const url = constants.SUPNUEVO_TEST_BASE_URL + '/func/customer/getSupnuevoCustomerOrderPrevInfo';
  const body = {};

  return post(url ,body);
}

// 获取所有历史订单
export function getSupnuevoCustomerOrderListOfDate(orderDate) {
  const url = constants.SUPNUEVO_TEST_BASE_URL + '/func/customer/getSupnuevoCustomerOrderListOfDate';
  const body = {
    orderDate: orderDate
  };

  return post(url ,body);
}
