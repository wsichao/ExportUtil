<template>
  <div class="main">
    <div class="container" style="z-index:1">
      <div class="leftShowData">
        <el-button class="exportBtn" v-on:click="startSql">执行</el-button>
        <el-input type="textarea" style="margin:10px 0 0 10px" v-model="sqlText" :rows="15" placeholder="SELECT * FROM [说明：输入SQL语句，不支持以'DELETE、UPDATE、TRUNCATE、DROP、MERGE'为首的语句输入]"></el-input>
        <div  style="margin:10px 0 0 10px"><span style="font-size: 16px">查看结果: </span>
          <el-radio v-model="viewNumber" label="5" style="color: #000">5条</el-radio>
          <el-radio v-model="viewNumber" label="10" style="color: #000">10条</el-radio>
          <el-radio v-model="viewNumber" label="20" style="color: #000">20条</el-radio>
          <el-radio v-model="viewNumber" label="50" style="color: #000">50条</el-radio>
        </div>
          <div class="tableData"  style="margin:10px 0 0 10px">
            <el-table class="tables" :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)" style="border: #ccc 1px solid; header-row-style:height: 30px; row-style:height: 20px" height="460" max-height="460">
              <el-table-column v-for="item in tableName" :key="item" :label="item" :prop="item" :show-overflow-tooltip="true" min-width="200"></el-table-column>
            </el-table>
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-size="pagesize"
              layout="prev, pager, next, sizes, jumper, total"
              :total="tableData.length">
            </el-pagination>
          </div>
      </div>
      <div class="rightShowData">
          <div class="rightTitle">
            <div>
              <span style="margin-left: 15px">数据导出</span>
            </div>
            <div>
              <el-button style="margin: 0 30px 0 0;" v-on:click="download" id="btn2" size="mini">下载<i class="el-icon-download el-icon--right"></i></el-button>
            </div>
          </div>
          <div class="rightTitleTwo">
            <span style="margin-left: 25px">数据来源</span>
          </div>
          <div class="edition">
            <span style="margin-left: 25px">版本</span>
            <el-select v-model="editionValue" size="mini" :disabled="true" collapse-tags>
              <el-option
                v-for="item in editionOptions"
                :key="item.id"
                :label="item.label"
                v-model="item.label">
              </el-option>
            </el-select>
          </div>
          <div class="dataBaseSelect">
            <span style="margin-left: 25px">数据库</span>
            <span style="font-size: 10px">{{sqlSelect}}</span>
            <div v-show="deletImgShow" v-on:click="deletSelectRadio">
              <img src="static/delet.png" width="20" height="20">
            </div>
            <el-popover placement="right" width="700" trigger="click">
              <table style="width:100%">
                <tr>
                  <td style="height: 30px; width: 80px;">
                    大区库
                  </td>
                  <td @change="selectValue">
                    <el-radio v-model="radio" v-for="item in sqlTypeList" :key="item.id" :label="item.data">{{item.data}}</el-radio>
                  </td>
                </tr>
              </table>
              <table style="width:100%">
                <tr style="display: flex;flex-wrap: wrap;border-top: 1px solid rgba(0, 0, 0, 0.19);align-items: center">
                  <td style="height: 50px; width: 80px;">
                    成果库
                  </td>
                  <td @change="selectValue">
                    <el-radio v-model="radio" label="日成果库">日成果库</el-radio>
                    <el-radio v-model="radio" label="月成果库">月成果库</el-radio>
                  </td>
                </tr>
              </table>
              <table style="width:100%">
                <tr style="display: flex;flex-wrap: wrap;border-top: 1px solid rgba(0, 0, 0, 0.19);align-items: center">
                  <td style="width: 80px;height: 50px;">
                    自定义库
                  </td>
                  <td>
                    <el-input v-model="userId" type="text" style="width: 100px;height: 30px" @change="diyTest" placeholder="用户名"/>
                  </td>
                  <td>
                    <el-input v-model="passWord" type="text" style="width: 100px;height: 30px" @change="diyTest" placeholder="口令"/>
                  </td>
                  <td>
                    <el-input v-model="sqlTypeText" type="text" style="width: 100px;height: 30px" @change="diyTest" placeholder="数据库"/>
                  </td>
                </tr>
              </table>
              <el-button style="margin-right: 20px; width: 80px" v-on:click="showSqlList" size="mini" slot="reference">请选择</el-button>
            </el-popover>
          </div>
          <div></div>
          <div class="exportMode">
            <div>
              <span style="margin-left: 15px">导出方式</span>
            </div>
          </div>
          <div class="edition">
            <span style="margin-left: 25px">导出方式</span>
            <el-select v-model="selectExportValue" @change="choseValue($event)" size="mini" :disabled="selectShow" collapse-tags placeholder="请选择">
              <el-option v-for="item in exportModeOptions" :key="item.id" :label="item.label" :value="item.id" v-model="item.label">
              </el-option>
            </el-select>
            <el-popover placement="right" width="400" trigger="click">
              <table style="width:100%">
                <tr>
                  <td style="height: 30px; width: 80px;">
                    按{{selectExportValue}}导出
                  </td>
                </tr>
                <div v-if="selectExportValue == '省份'">
                  <tr style="display: flex;flex-wrap: wrap;width: auto">
                    <td v-for="item in provinceName" :key="item.province" style="display: flex;flex-wrap: wrap;" :label="item" @change="checkValue">
                      <el-checkbox v-model="checkData" :label="item.province">{{item.province}}</el-checkbox>
                    </td>
                  </tr>
                </div>
                <div v-if="selectExportValue == '城市'">
                  <tr v-for="item in provinceName" :key="item.province" style="display: flex;flex-wrap: wrap;border-top: 1px solid rgba(0, 0, 0, 0.19)">
                    <td style="border-right: 1px solid #000;background: rgba(100, 100, 194, 0.7);color: #fff">
                      {{item.province}}
                    </td>
                      <td v-for="citys in item.cityList" :key="citys" :label="citys" @change="checkValue">
                        <el-checkbox v-model="checkCityData" :label="citys">{{citys}}</el-checkbox>
                      </td>
                  </tr>
                </div>
              </table>
              <el-button style="margin-right: 20px; width: 80px;" :disabled="btnShow" v-on:click="showExportSqlList" size="mini" slot="reference">请选择</el-button>
            </el-popover>
          </div>
          <div class="selectExportItem" v-if="selectExportValue == '城市'" v-for="item in checkCityData" :key="item">
            <span>{{item}}</span>
            <div v-on:click="deletSelectCheck(item)">
              <img src="static/delet.png" width="20" height="20">
            </div>
          </div>
          <div class="selectExportItem"  v-if="selectExportValue == '省份'" v-for="item in checkData" :key="item">
            <span>{{item}}</span>
            <div v-on:click="deletSelectCheckPro(item)">
              <img src="static/delet.png" width="20" height="20">
            </div>
          </div>
          <div class="edition" v-if="addExportShow">
            <span style="margin-left: 25px">合并导出</span>
            <el-radio v-model="addradio" label="1" style="margin-right: 20px;width: 50px;color: rgb(70, 68, 68)">是</el-radio>
            <el-radio v-model="addradio" label="2" style="margin-right: 20px;width: 150px;color: rgb(70, 68, 68)">否</el-radio>
          </div>
          <div class="edition" v-if="mapNumberShow">
            <span style="margin-left: 25px">图幅号</span>
            <el-input type="text" v-model="meshId" size="mini" placeholder="多条图幅号时，请以半角逗号作为间隔符号" style="margin-right: 20px;width: 300px"/>
          </div>
          <div class="edition">
            <span style="margin-left: 25px">导出名称</span>
            <el-input type="text" size="mini" v-model="fileName" style="margin-right: 20px;width: 300px"/>
          </div>
        <!-- </el-card> -->
      </div>
    </div>
  </div>
</template>

<script>
import { getSqlList, getStartSql, getDownLoadUrl, getExportCity } from '../dataService/api';
import { appUtil } from '../config'
import plan from '../data/plan.js'
import $ from 'jquery'
// import VueSweetalert2 from './vue-sweetalert2'
// Vue.use(VueSweetalert2)
export default {
  name: 'Main',
  data() {
    return {
      tableData: [],
      currentPage: 1, //初始页
      pagesize: 10, // 每页的数据
      viewNumber: '5', // 查看结果显示条数
      sqlText: '', // 用户输入的查询语句
      radio: 0, // 数据库类型的勾选
      addradio: 0, // 合并导出勾选项
      userId: '', // 自定义库的账号
      passWord: '', // 自定义库的密码
      sqlTypeText: '', // 自定义库的数据库
      sqlSelect: '', // 勾选项的value
      meshId: '', // 图幅号
      fileName: '', // 导出文件名
      editionValue: 'fm_sys',
      selectExportValue: '省份',
      btnShow: false,
      selectShow: false,
      addExportShow: true,
      mapNumberShow: false,
      deletImgShow: false,
      deletCheckImgShow: false,
      checkData: [],
      checkCityData: [], // 城市和省份的勾选需要进行区分，否则会存在联动
      allCheckData: [],
      provinceName: [],
      sqlTypeList: [], // 数据库类型列表
      sqlRegionData: [],
      sqlDayMon: [],
      tableName: [],
      editionOptions: [{
        id: 'editionNow',
        label: 'fm_sys'
      }],
      exportModeOptions: [{
        id: 'map',
        label: '图幅'
      },{
        id: 'allLibrary',
        label: '整库'
      },{
        id: 'province',
        label: '省份'
      },{
        id: 'city',
        label: '城市'
      }],
    }
  },
  // computer: {},
  methods: {
    handleSizeChange(size) {
        this.pagesize = size;
    },
    handleCurrentChange(currentPage) {
        this.currentPage = currentPage;
    },

    showSqlList() { // 获取数据库类型
      const self = this;
      getSqlList({}).then(function(res){
        if (res.data != []) {
            const sqlTypeSet = new Set();
            self.sqlDayMon = res.data;
            self.sqlRegionData = res.data.regionRoad;
            res.data.regionRoad.forEach(item=>sqlTypeSet.add(item.regionId));
            self.sqlTypeList = plan.filter(item=>sqlTypeSet.has(item.id));
        } else {
          self.$alert(res.errmsg, '警告', {
            confirmButtonText: '确定',
            callback: action => {
              self.$message({
                type: 'info',
                message: `action: ${ action }`
              });
            }
          });
        }
      })
    },    
    
    showExportSqlList () {
      if (this.radio == 0) {
        this.$alert('请先选择数据库！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      }
    
      var selectId = this.sqlTypeList.filter(e => e.data == this.radio)[0].id;
      const self = this;
      var param = {
        regionId: selectId
      }
      getExportCity({param}).then(function(res){
        if (res.data != null) {
          // for (let i = 0; i < res.data.length; i++) {
            self.provinceName = res.data // [i].province
          // }
        } else {
          self.$alert(res.errmsg, '警告', {
            confirmButtonText: '确定',
            callback: action => {
              self.$message({
                type: 'info',
                message: `action: ${ action }`
              });
            }
          });
        }
      })
    }, // 导出数据库类型

    startSql() { // 执行按钮
      let newSqlText = this.sqlText.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      if (['delete', 'update', 'truncate', 'drop', 'merg'].includes(newSqlText.split(' ')[0])) {
        this.$alert('非法语句，请检查！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      }
      if (this.sqlText === '') {
        this.$alert('SQL语句不能为空！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      } else if (this.radio == 0 && this.userId == '' && this.passWord == '' && this.sqlTypeText == '') {
        this.$alert('请先选择数据库！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      }
      if (this.selectExportValue == '图幅' && this.meshId == '') {
        this.$alert('请先输入图幅号！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      }
      if (this.selectExportValue == '省份' && this.checkData.length == 0) {
        this.$alert('请先选择省份！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      } else if (this.selectExportValue == '城市' && this.checkCityData.length == 0) {
        this.$alert('请先选择城市！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      }

      if (this.radio == '日成果库') {
        var selectDbid = this.sqlDayMon.desDayAll
      } else if (this.radio == '月成果库') {
        var selectDbid = this.sqlDayMon.desMonAll
      } else if (this.radio != 0) {
        var selectId = this.sqlTypeList.filter(e => e.data == this.radio)[0].id;
        selectDbid = this.sqlRegionData.filter(e => e.regionId == selectId)[0].dbId;
      }

      var regionTypeData = 0;
      if (this.selectExportValue == '省份') {
        regionTypeData = 1
      } else if (this.selectExportValue == '城市') {
        regionTypeData = 2
      } else if (this.selectExportValue == '图幅') {
        regionTypeData = 3
      } else {
        regionTypeData = 0
      }

      var checkDatas = []; // 解决省份和城市数据异常联动问题
      var regionListData = [];
      var provinceIds = [];
      if (this.selectExportValue == '省份') {
        var selectProvince = this.provinceName;
        this.checkData.forEach(item=> {
            provinceIds.push(selectProvince.filter(e => e.province == item)[0].provinceId);
        });
        checkDatas = provinceIds
      } else if (this.selectExportValue == '城市') {
        checkDatas = this.checkCityData
      }
      regionListData = Object.values(checkDatas).join(',');
      var meshIdCDB = ToCDB(this.meshId)
      let param = {
        dbId: selectDbid,
        count: this.viewNumber,
        sqlstr: this.sqlText,
        meshList: meshIdCDB,
        user: this.userId,
        password: this.passWord,
        dbParam: this.sqlTypeText,
        regionType: regionTypeData,
        regionList: regionListData
      }
      if (this.radio == 0) {
        param = {
          count: this.viewNumber,
          sqlstr: this.sqlText,
          meshList: meshIdCDB,
          user: this.userId,
          password: this.passWord,
          dbParam: this.sqlTypeText,
          regionType: regionTypeData,
          regionList: regionListData
        }
      }

      const self = this;
      getStartSql({param}).then(function(res){ // 执行接口
        if (res.data != null && res.data.length != 0) {
          self.tableData = res.data,
          self.tableName = Object.keys(res.data[0])
        } else if (res.data == null) {
          self.$alert(res.errmsg, '警告', {
            confirmButtonText: '确定',
            callback: action => {
              self.$message({
                type: 'info',
                message: `action: ${ action }`
              });
            }
          });
        } else {
            self.$alert("未查询到相关数据！", '警告', {
            confirmButtonText: '确定',
            callback: action => {
              self.$message({
                type: 'info',
                message: `action: ${ action }`
              });
            }
          });
        }
      })
    },

    download() { // 下载按钮
      let newSqlText = this.sqlText.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      if (['delete', 'update', 'truncate', 'drop', 'merg'].includes(newSqlText.split(' ')[0])) {
        this.$alert('非法语句，请检查！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      }
      if (this.sqlText === '') {
        this.$alert('SQL语句不能为空！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      } else if (this.radio == 0 && this.userId == '' && this.passWord == '' && this.sqlTypeText == '') {
        this.$alert('请先选择数据库！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      } else if (this.addradio == 0 && this.selectExportValue != '整库' &&  this.selectExportValue != '图幅') {
        this.$alert('请先选择合并导出方式！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      } else if (this.fileName == '') {
        this.$alert('导出名称不能为空！', '警告', {
          confirmButtonText: '确定',
          callback: action => {
            this.$message({
              type: 'info',
              message: `action: ${ action }`
            });
          }
        });
        return
      }

      var regionTypeData = 0;
      if (this.selectExportValue == '省份') {
        regionTypeData = 1
      } else if (this.selectExportValue == '城市') {
        regionTypeData = 2
      } else if (this.selectExportValue == '图幅') {
        regionTypeData = 3
      } else {
        regionTypeData = 0
      }

      if (this.radio == '日成果库') {
        var selectDbid = this.sqlDayMon.desDayAll
      } else if (this.radio == '月成果库') {
        var selectDbid = this.sqlDayMon.desMonAll
      } else if (this.radio != 0) {
        var selectId = this.sqlTypeList.filter(e => e.data == this.radio)[0].id;
        selectDbid = this.sqlRegionData.filter(e => e.regionId == selectId)[0].dbId;
      }

      if (this.addradio == 1) {
        var conbineData = true
      } else if (this.addradio == 2) {
        conbineData = false
      }

      var checkDatas = []; // 解决省份和城市数据异常联动问题
      var regionListData = [];
      var provinceIds = [];
      if (this.selectExportValue == '省份') {
        var selectProvince = this.provinceName;
        this.checkData.forEach(item=> {
            provinceIds.push(selectProvince.filter(e => e.province == item)[0].provinceId);
        });
        checkDatas = provinceIds
      } else if (this.selectExportValue == '城市') {
        checkDatas = this.checkCityData
      }
      regionListData = Object.values(checkDatas).join(',')
      var meshIdCDB = ToCDB(this.meshId)
      var param = {
        sqlstr: this.sqlText,
        fileName: this.fileName,
        meshList: meshIdCDB,
        dbId: selectDbid,
        user: this.userId,
        isCombine: conbineData,
        password: this.passWord,
        dbParam: this.sqlTypeText,
        regionType: regionTypeData,
        regionList: regionListData
      }

      const self = this;
      getDownLoadUrl({param}).then(function(res){ // 下载
        if (res.data != null) {
          var $eleForm = $("<form method='get'></form>");
          $eleForm.attr("action", res.data);
          $(document.body).append($eleForm);
          $eleForm.submit();
        } else if (res.data == null) {
          // 弹窗
          self.$alert(res.errmsg, '警告', {
            confirmButtonText: '确定',
            callback: action => {
              self.$message({
                type: 'info',
                message: `action: ${ action }`
              });
            }
          });
        } else {
          self.$alert('请检查下载接口！！！', '警告', {
            confirmButtonText: '确定',
            callback: action => {
              self.$message({
                type: 'info',
                message: `action: ${ action }`
              });
            }
          });
        }
      });
    },

    // selectTypeData () {
    //   if (this.checkData != []) {
    //     this.allCheckData.push(this.checkData)
    //   } else if (this.checkCityData != []) {
    //     this.allCheckData.push(this.checkCityData)
    //   }
    //   return this.allCheckData
    // },
    choseValue: choseValue, // 导出方式
    selectValue: selectValue, // 勾选大区库或成果库，联动
    checkValue: checkValue,
    deletSelectRadio: deletSelectRadio, // 清空按钮
    deletSelectCheck: deletSelectCheck, // 多选清空
    deletSelectCheckPro: deletSelectCheckPro,
    ToCDB: ToCDB, // 全角转半角
    tablePagination: tablePagination,
    diyTest: diyTest // 自定义输入时互斥
  },
  // watch: {
  //     checkCityData(val) {
  //       console.log(val)
  //     }
  // },
}

function tablePagination() {
}
function choseValue(item) { // 导出栏点击按钮页面数据
  // if (this.checkData.length != 0) {
  //   // 弹窗
  //   this.$alert('请先取消勾选项再切换', '警告', {
  //     confirmButtonText: '确定',
  //     callback: action => {
  //       this.$message({
  //         type: 'info',
  //         message: `action: ${ action }`
  //       });
  //     }
  //   });
  //   return
  // }
  if (item == '图幅') {
    this.selectExportValue = item
    this.btnShow = true
    this.addExportShow = false
    this.mapNumberShow = true
  } else if (item == '整库') {
    this.selectExportValue = item
    this.btnShow = true
    this.addExportShow = false
    this.mapNumberShow = false
  } else if (item == '省份') {
    this.selectExportValue = item
    this.btnShow = false
    this.addExportShow = true
    this.mapNumberShow = false
  } else if (item == '城市') {
    this.selectExportValue = item
    this.btnShow = false
    this.addExportShow = true
    this.mapNumberShow = false
  }
}

function selectValue() { // 勾选联动
  this.checkCityData = [],
  this.checkData = [],
  this.sqlSelect = this.radio
  if (this.radio != '') {
    this.deletImgShow = true
  }
  this.userId = '',
  this.passWord = '',
  this.sqlTypeText = '',
  this.selectShow = false
  
  if (this.radio == '日成果库' || this.radio == '月成果库') { // 如果选择的是日月成果库，由于需求不明，暂时只能按整库来导出，后续需要改善
    this.btnShow = true,
    this.selectShow = true,
    this.addExportShow = false,
    this.mapNumberShow = false,
    this.selectExportValue = '整库'
  }
}

function checkValue() {
  if (this.selectExportValue == '省份') {
    this.allCheckData = this.checkData
  } else if (this.selectExportValue == '城市') {
    this.allCheckData = this.checkCityData
  }
  if (this.allCheckData != '') {
    this.deletCheckImgShow = true
  }
}

function deletSelectRadio() { // 勾选联动之后删除功能
  this.radio = 0,
  this.sqlSelect = '',
  this.deletImgShow = false,
  this.userId = '',
  this.passWord = '',
  this.sqlTypeText = ''
}

function deletSelectCheck(item) {
  this.checkCityData = this.checkCityData.filter(i => {
    return i != item
  }),
  this.deletCheckImgShow = false
  // this.checkCityData = '',
  // this.checkData = ''
}

function deletSelectCheckPro(item) {
  this.checkData = this.checkData.filter(i => {
    return i != item
  }),
  this.deletCheckImgShow = false
  // this.checkCityData = '',
  // this.checkData = ''
}

function diyTest() { // 自定义与(大区库和成果库)互斥
  this.radio = 0,
  this.sqlSelect = '',
  this.deletImgShow = false,
  this.btnShow = true,
  this.selectShow = true,
  this.addExportShow = false,
  this.mapNumberShow = false,
  this.selectExportValue = '整库'
}

  function ToCDB(str) {
      var tmp = "";
      for (var i = 0; i < str.length; i++) {
          if (str.charCodeAt(i) > 65248 && str.charCodeAt(i) < 65375) {
              tmp += String.fromCharCode(str.charCodeAt(i) - 65248);
          }
          else {
              tmp += String.fromCharCode(str.charCodeAt(i));
          }
      }
      return tmp
  }

</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.main{
    height: 100%;
    width: 100%;
    position:absolute;
  .container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    .leftShowData {
      height: 100%;
      width: 75%;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      z-index: 1;
      .exportBtn {
        width: 70px;
        height: 40px;
        color: #fff;
        background: #4aaaf4;
        box-shadow: 1px -1px 4px #444;
        transition: background-color .5s;
        margin: 10px 0 0 10px
      }
      .exportBtn:hover {
        background-color: purple;
      }
      .textarea {
        width: 96%;
        height: 50%;
        margin: 10px 0 0 50px;
      }
      .showData {
        width: 500px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-left: 15px;
        color: #fff;
        font-size: 14px;
        background: #4aaaf4;
        transition: background-color .5s;
        margin: 0 0 0 50px
      }
      .showData:hover {
        background-color: purple;
      }
      .tableData {
        width: 100%;
        height: 20%;
        font-size: 14px;
        // box-shadow: 0px 0px 4px #444;
        // margin-left:50px;
      }
    }
    .rightShowData {
      height: 100%;
      width: 25%;
      padding-left: 10px;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      .rightTitle {
        width: 95%;
        height: 40px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        margin: 10px 0 0 10px;
        font-size: 16px;
        border-radius: 5px 5px 0 0;
        color: #fff;
        background-color: #4aaaf4
      }
      .rightTitleTwo {
        width: 95%;
        height: 40px;
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-left: 10px;
        color: rgb(70, 68, 68);
        border-top: #eceaea solid 1px;
        background-color: #fff
      }
      .exportMode {
        width: 95%;
        height: 40px;
        display: flex;
        align-items: center;
        font-size: 16px;
        color: #fff;
        margin-left: 10px;
        border-top: #eceaea solid 0.5px;
        background-color: #4aaaf4
      }
      .edition {
        width: 95%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: rgb(70, 68, 68);
        margin-left: 10px;
        border-top: #eceaea solid 0.5px;
        background-color: #fff
      }
      .selectExportItem {
        width: 95%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        font-size: 14px;
        color: rgb(70, 68, 68);
        margin-left: 10px;
        border-top: #eceaea solid 0.5px;
        background-color: #fff
      }
      .dataBaseSelect {
        width: 95%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: rgb(70, 68, 68);
        margin-left: 10px;
        border-top: #eceaea solid 0.5px;
        background-color: #fff
      }
      .sqlSelectItem {
        width: 95%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: rgb(70, 68, 68);
        border-top: #eceaea solid 0.5px;
        background-color: #fff
      }
    }
  }
}
</style>