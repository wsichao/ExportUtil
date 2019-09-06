/**
 * @description 前端页面定义的接口调用
 * @file api.js
 *
 * @copyright @Navinfo, all rights reserved.
 */

import axios from 'axios';

// 统一增加token
var getReq = function (url, param) {
    return axios.get(`${url}`, {params: param})
    .then(res => res.data)
    .catch(res => ({errcode: null}));
};

export const getSqlList = param => { return getReq(`${window.config.url}/editor/export/queryDbs?reqContext={"countryCode":"CN"}`)}; // 获取数据库类型

export const getStartSql = param => { return getReq(`${window.config.url}/editor/export/execSql?reqContext={"countryCode":"CN"}`, param)}; // 执行按钮

export const getDownLoadUrl = param => { return getReq(`${window.config.url}/editor/export/exportshp?reqContext={"countryCode":"CN"}`, param)}; // 下载按钮

export const getExportCity = param => { return getReq(`${window.config.url}/editor/export/queryArea?reqContext={"countryCode":"CN"}`)}; // 获取区域