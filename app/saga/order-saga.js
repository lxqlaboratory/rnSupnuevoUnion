/**
 * shopping-saga.js
 */

import {call, put, take, takeEvery} from "redux-saga/effects";
import * as actions from "../actions/action-types";
import * as Api from "../api/OrderApi";
import * as orderActions from "../actions/order-actions";
import * as authActions from "../actions/auth-actions";
import strings from '../resources/strings';

// 获取当前订单
function* getSupnuevoCustomerOrderPrevInfo (action) {
  try {
    const response = yield call(Api.getSupnuevoCustomerOrderPrevInfo);
    if (response.re === 1) {
      const data = response.data;
      const orderItemList = data.orderItemList;
      const discountItemList = data.discountItemList;
      const totalFee = data.totalFee;
      const discountFee = data.discountFee;
      const totalFeeFinal = data.totalFeeFinal;
      yield put(orderActions.getOrderPrevInfoSuccess(orderItemList, discountItemList, totalFee, discountFee, totalFeeFinal));
    } else {
      yield put(orderActions.getOrderPrevInfoFail(strings.getPrevOrderFail));
    }
  } catch (error) {
    yield put(orderActions.getOrderPrevInfoFail(error));
  }
}

// 获取订单列表
function* getSupnuevoCustomerOrderListOfDate (action) {
  const {orderDate} = action
  try {
    const response = yield call(Api.getSupnuevoCustomerOrderListOfDate, orderDate);
    if (response.re === 1) {
      const orderList = response.data;
      yield put(orderActions.getOrderListSuccess(orderList));
    } else {
      yield put(orderActions.getOrderListFail(strings.getOrderListFail));
    }
  } catch (error) {
    yield put(orderActions.getOrderListFail(error))
  }
}

// 提交订单
function* submitSupnuevoCustomerOrder (action) {
  const {deliveryInfo} = action;
  try {
    const response = yield call(Api.submitSupnuevoCustomerOrder, deliveryInfo);
    if (response.re === 1) {
      yield put(orderActions.submitOrderSuccess());
    } else {
      yield put(orderActions.submitOrderFail(strings.submitOrderFail));
    }
  } catch (error) {
    yield put(orderActions.submitOrderFail(error))
  }
}

export default [
  takeEvery(actions.GET_PREV_ORDER, getSupnuevoCustomerOrderPrevInfo),
  takeEvery(actions.GET_ORDER_LSIT, getSupnuevoCustomerOrderListOfDate),
  takeEvery(actions.SUBMIT_ORDER_INFO, submitSupnuevoCustomerOrder),
]
