<template>
  <div class="main" v-loading="downloadLoad" element-loading-text="拼命下载中">
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
            <el-table v-loading="loading" class="tables" :data="tableData.slice((currentPage-1)*pagesize,currentPage*pagesize)" style="border: 1px solid #DCDFE6; header-row-style:height: 30px; row-style:height: 20px" height="460" max-height="460">
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

      <!-- 左右布局分割线 -->

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
            <span style="margin-left: 13px">数据来源</span>
          </div>
          <div class="edition">
            <span style="margin-left: 13px">版本</span>
            <el-select style="margin-right: 5px;" v-model="editionValue" size="mini" :disabled="true" collapse-tags>
              <el-option
                v-for="item in editionOptions"
                :key="item.id"
                :label="item.label"
                v-model="item.label">
              </el-option>
            </el-select>
          </div>
          <div class="dataBaseSelect">
            <span style="margin-left: 13px">数据库</span>
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
                    <el-checkbox v-model="radio" :disabled="sqlChecked"></el-checkbox>
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
              <el-button style="margin-right: 5px; width: 80px" v-on:click="showSqlList" size="mini" slot="reference">请选择</el-button>
            </el-popover>
          </div>



          
          <div class="exportMode">
            <div>
              <span style="margin-left: 15px">导出方式</span>
            </div>
          </div>
          <div class="edition">
            <span style="margin-left: 13px">导出方式</span>
            <el-select v-model="selectExportValue" @change="choseValue($event)" size="mini" :disabled="selectShow" collapse-tags placeholder="请选择">
              <el-option v-for="item in exportModeOptions" :key="item.id" :label="item.label" :value="item.id" :disabled="item.disabled" v-model="item.label">
              </el-option>
            </el-select>
            <el-button style="margin-right: 5px; width: 80px;" :disabled="btnShow" v-on:click="showExportSqlList" size="mini" slot="reference">请选择</el-button>
            <el-dialog :visible.sync="provinceDialog" title="按省份导出" center :append-to-body="true" :lock-scroll="false" width="40%">
              <table style="width:100%">
                <tr style="display: flex;flex-wrap: wrap;width: auto">
                  <td v-for="item in provinceName" :key="item.province" style="display: flex;flex-wrap: wrap;" :label="item" @change="checkValue">
                    <el-checkbox v-model="checkData" :label="item.province">{{item.province}}</el-checkbox>
                  </td>
                </tr>
              </table>
            </el-dialog>
            <el-dialog :visible.sync="cityDialog" title="按区域导出" center :append-to-body="true" :lock-scroll="false" width="60%">
              <table style="width:100%">
                <tr v-for="(item, index) in citySelectArr" :key="index">
                  <td style="width: 30%">
                    <span>省份： </span>
                    <el-select v-model="item.lable" @change="provinceOptionChange(item)" style="width: 50%" filterable>
                      <el-option v-for="items in provinceOptionsDemo" :key="items" :label="items" :value="items"></el-option>
                    </el-select>
                  </td>
                  <td style="width: 70%">
                    <span>区域： </span>
                    <el-select v-model="item.citys" @change="cityOptionChange(item)" style="width: 90%" filterable multiple>
                      <el-option v-for="ele in item.cityOptions" :key="ele" :label="ele" :value="ele"></el-option>
                    </el-select>
                  </td>
                  <td v-if="index === 0">
                    <el-button icon="el-icon-plus" @click="addCitySelect()" circle></el-button>
                  </td>
                  <td v-if="index !==0">
                    <el-button icon="el-icon-minus" @click="deleteCitySelect(index)" circle></el-button>
                  </td>
                </tr>
              </table>
            </el-dialog>
          </div>
          <div v-for="items in citySelectArr" >
            <div class="selectExportItem" v-if="selectExportValue === '区域'" v-for="item in items.citys" :key="item">
              <span style="width: 170px">{{item}}</span>
              <div v-on:click="deletSelectCheck(item)">
                <img src="static/delet.png" width="20" height="20">
              </div>
            </div>
          </div>
          <div class="selectExportItem" v-if="selectExportValue === '省份'" v-for="item in checkData" :key="item">
            <span>{{item}}</span>
            <div v-on:click="deletSelectCheckPro(item)">
              <img src="static/delet.png" width="20" height="20">
            </div>
          </div>
          <div class="edition" v-if="addExportShow">
            <span style="margin-left: 13px">合并导出</span>
              <el-radio v-model="addradio" label="1" style="margin-right: 25px;color: rgb(70, 68, 68)">是</el-radio>
              <el-radio v-model="addradio" label="2" style="margin-right: 180px;color: rgb(70, 68, 68)">否</el-radio>
          </div>
          <div class="edition" v-if="mapNumberShow">
            <span style="margin-left: 13px">图幅号</span>
            <el-input type="text" v-model="meshId" size="mini" placeholder="多条图幅号时，请以半角逗号作为间隔符号" style="margin-right: 180px;width: 193px"/>
          </div>
          <div class="edition" style="border-bottom: #eceaea solid 1px;">
            <span style="margin-left: 13px">导出名称</span>
            <el-input type="text" size="mini" v-model="fileName" style="margin-right: 180px;width: 193px"/>
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
      provinceOptions: [], // 省份下拉框值域
      provinceOptionsDemo: [],
      cityOptions: [], // 城市下拉框值域
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
      selectExportValue: '区域',
      loading: false, // 加载动画
      downloadLoad: false, // 全屏加载
      btnShow: false,
      cityDialog: false, // 城市列表弹窗控制
      provinceDialog: false,
      selectShow: false,
      addExportShow: true,
      mapNumberShow: false,
      deletImgShow: false,
      deletCheckImgShow: false,
      sqlChecked: false,
      checkData: [],
      checkCityData: [], // 城市和省份的勾选需要进行区分，否则会存在联动
      allCheckData: [],
      provinceName: [],
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
        label: '整库',
        disabled: false
      },{
        id: 'province',
        label: '省份'
      },{
        id: 'city',
        label: '区域'
      }],
      citySelectArr: [
        {
          lable: '请选择',
          citys:[]
        }
      ],
    }
  },
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

    // 导出方式 '请选择' 按钮触发事件
    showExportSqlList () {
      if (this.radio == 0) {
        this.$alert('请先选择数据库！', '警告', {
          confirmButtonText: '确定',
        });
        return
      }
      if (this.selectExportValue == '区域') {
        this.cityDialog = true;
      } else if (this.selectExportValue == '省份') {
        this.provinceDialog = true;
      }
      const self = this;
      self.provinceOptions = [];
      var param = {};
      getExportCity({param}).then(function(res){
        if (res.data != null) {
          self.provinceName = res.data
          self.provinceName.forEach(item => {
            self.provinceOptions.push(item.province);
          });
          self.provinceOptionsDemo = [...self.provinceOptions]; // 备份省份下拉框值域

          var dataSelect = [...self.provinceOptions]; // 解决多次点击'请选择'按钮时，省份下拉框值域需要重新筛选
          self.citySelectArr.forEach(item => {
            self.provinceOptions.forEach(ele => {
              if (item.lable !== '' && ele === item.lable) {
                dataSelect.splice(dataSelect.indexOf(item.lable), 1)
              }
            })
          })
          self.provinceOptionsDemo = dataSelect
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

    // 添加一组下拉框
    addCitySelect () {
      this.citySelectArr.push({}); // 添加一组下拉框的控制

      var dataSelect = [...this.provinceOptions]; // 添加下拉框后，省份下拉框值域的变动处理
      this.citySelectArr.forEach(item => {
        this.provinceOptions.forEach(ele => {
          if (item.lable !== '' && ele === item.lable) {
            dataSelect.splice(dataSelect.indexOf(item.lable), 1)
          }
        })
      })
      this.provinceOptionsDemo = dataSelect
    },
    // 删除一组下拉框
    deleteCitySelect (index) {
      this.citySelectArr.splice(index, 1); // 删除控制

      var dataSelect = [...this.provinceOptions]; // 删除后省份下拉框值域对应恢复
      this.citySelectArr.forEach(item => {
        this.provinceOptions.forEach(ele => {
          if (item.lable !== '' && ele === item.lable) {
            dataSelect.splice(dataSelect.indexOf(item.lable), 1)
          }
        })
      })
      this.provinceOptionsDemo = dataSelect
    },

    // 切换省份下拉框触发事件
    provinceOptionChange (province) {
      var dataSelect = [...this.provinceOptions]; // 切换省份，下拉框的值域相应变更
      this.citySelectArr.forEach(item => {
        this.provinceOptions.forEach(ele => {
          if (item.lable !== '' && ele === item.lable) {
            dataSelect.splice(dataSelect.indexOf(item.lable), 1)
          }
        })
      })
      this.provinceOptionsDemo = dataSelect

      province.citys = []; // 切换省份，获取省份对应的区域
      var data = [];
      data.push(this.provinceName.filter(item => {
        return item.province === province.lable
      })[0].cityList);
      province.cityOptions = data[0];
      
    },
    // 切换区域下拉框触发事件
    cityOptionChange () {
    },

     // 执行按钮触发事件
    startSql() {
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
      }

      if (this.radio === '日成果库') {
        var selectDbid = this.sqlDayMon.desDayAll
      } else if (this.radio === '月成果库') {
        var selectDbid = this.sqlDayMon.desMonAll
      } else if (this.radio === true) {
        selectDbid = '';
      }

      var regionTypeData = 0;
      if (this.selectExportValue === '省份') {
        regionTypeData = 1
      } else if (this.selectExportValue === '区域') {
        regionTypeData = 2
      } else if (this.selectExportValue === '图幅') {
        regionTypeData = 3
      } else {
        regionTypeData = 0
      }

      var checkDatas = []; // 解决省份和城市数据异常联动问题
      var regionListData = [];
      var provinceIds = [];
      if (this.selectExportValue === '省份') {
        checkDatas = this.checkData
      } else if (this.selectExportValue === '区域') {
        this.citySelectArr.forEach(item =>{
          item.citys.forEach(ele => {
            checkDatas.push(ele);
          })
        })
        if (checkDatas.length === 0) {
          this.$alert('请先选择区域！', '警告', {
            confirmButtonText: '确定',
          });
          return
        }
      }
      regionListData = Object.values(checkDatas).join(',');
      var meshIdCDB = ToCDB(this.meshId);
      // 执行接口传参
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
      if (this.radio == 0) { // radio为0时，则代表用户选择的是自定义导出，即输入了账户密码
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
      self.loading = true;
      getStartSql({param}).then(function(res){ // 执行接口
        self.loading = false;
        if (res.data != null && res.data.length != 0) {
          self.tableData = res.data,
          self.tableName = Object.keys(res.data[0])
        } else if (res.data == null) {
          self.$alert(res.errmsg, '警告', {
            confirmButtonText: '确定',
          });
        } else {
            self.$alert("未查询到相关数据！", '警告', {
            confirmButtonText: '确定',
          });
        }
      })
    },

    // 下载按钮
    download() {
      let newSqlText = this.sqlText.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      if (['delete', 'update', 'truncate', 'drop', 'merg'].includes(newSqlText.split(' ')[0])) {
        this.$alert('非法语句，请检查！', '警告', {
          confirmButtonText: '确定',
        });
        return
      }
      if (this.sqlText === '') {
        this.$alert('SQL语句不能为空！', '警告', {
          confirmButtonText: '确定',
        });
        return
      } else if (this.radio == 0 && this.userId == '' && this.passWord == '' && this.sqlTypeText == '') {
        this.$alert('请先选择数据库！', '警告', {
          confirmButtonText: '确定',
        });
        return
      } else if (this.addradio == 0 && this.selectExportValue != '整库' &&  this.selectExportValue != '图幅') {
        this.$alert('请先选择合并导出方式！', '警告', {
          confirmButtonText: '确定',
        });
        return
      } else if (this.fileName == '') {
        this.$alert('导出名称不能为空！', '警告', {
          confirmButtonText: '确定',
        });
        return
      }

      var regionTypeData = 0;
      if (this.selectExportValue == '省份') {
        regionTypeData = 1
      } else if (this.selectExportValue == '区域') {
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
      } else if (this.radio == true) { // 选择大区库时，不需要传dbid
        selectDbid = '';
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
        checkDatas = this.checkData
      } else if (this.selectExportValue == '区域') {
        this.citySelectArr.forEach(item =>{
          item.citys.forEach(ele => {
            checkDatas.push(ele);
          })
        })
        if (checkDatas.length === 0) {
          this.$alert('请先选择区域！', '警告', {
            confirmButtonText: '确定',
          });
          return
        }
      }
      regionListData = Object.values(checkDatas).join(',')
      var meshIdCDB = ToCDB(this.meshId);
      // 下载接口传参
      var param = {
        dbId: selectDbid,
        sqlstr: this.sqlText,
        fileName: this.fileName,
        meshList: meshIdCDB,
        user: this.userId,
        isCombine: conbineData,
        password: this.passWord,
        dbParam: this.sqlTypeText,
        regionType: regionTypeData,
        regionList: regionListData
      }
      const self = this;
      self.downloadLoad = true;
      getDownLoadUrl({param}).then(function(res){ // 下载
        self.downloadLoad = false;
        if (res.data != null) {
          var $eleForm = $("<form method='get'></form>");
          $eleForm.attr("action", res.data);
          $(document.body).append($eleForm);
          $eleForm.submit();
        } else if (res.data == null) {
          // 弹窗
          self.$alert(res.errmsg, '警告', {
            confirmButtonText: '确定',
          });
        } else {
          self.$alert('请检查下载接口！！！', '警告', {
            confirmButtonText: '确定',
          });
        }
      });
    },

    choseValue: choseValue, // 导出方式
    selectValue: selectValue, // 勾选大区库或成果库，联动
    checkValue: checkValue,
    deletSelectRadio: deletSelectRadio, // 清空按钮
    deletSelectCheck: deletSelectCheck, // 多选清空
    deletSelectCheckPro: deletSelectCheckPro,
    ToCDB: ToCDB, // 全角转半角
    diyTest: diyTest // 自定义输入时互斥
  },
}
function choseValue(item) { // 导出栏点击按钮页面数据
  if (item == '图幅') {
    this.selectExportValue = item
    this.btnShow = true
    this.addExportShow = false
    this.mapNumberShow = true
    this.sqlChecked = false
  } else if (item == '整库') {
    this.selectExportValue = item
    this.btnShow = true
    this.addExportShow = false
    this.mapNumberShow = false
    this.sqlChecked = true
  } else if (item == '省份') {
    this.selectExportValue = item
    this.btnShow = false
    this.addExportShow = true
    this.mapNumberShow = false
    this.sqlChecked = false
  } else if (item == '区域') {
    this.selectExportValue = item
    this.btnShow = false
    this.addExportShow = true
    this.mapNumberShow = false
    this.sqlChecked = false
  }
}

function selectValue() { // 勾选联动
  this.checkCityData = [],
  this.checkData = [],
  this.sqlSelect = this.radio
  if (this.radio === true) {
    this.sqlSelect = '大区库',
    this.exportModeOptions[1].disabled = true
  } else if (this.radio === false) {
    this.sqlSelect = '',
    this.exportModeOptions[1].disabled = false,
    this.deletImgShow = false
  }
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
  } else if (this.selectExportValue == '区域') {
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
  this.sqlTypeText = '',
  this.exportModeOptions[1].disabled = false,
  this.selectShow = false
  if (this.selectExportValue === '整库') {
    this.sqlChecked = true
  }
}

// 区域选择后 删除功能
function deletSelectCheck(data) {
  this.citySelectArr.forEach(item =>{ // citySelectArr里面存放省份及区域所选值，以及区域的值域
    if (item.length !== 0) {
      var flag = item.citys.forEach(ele => { // citys里存放的是所选区域
        if (ele === data) {
          item.citys.splice(item.citys.indexOf(data), 1); // 获取当前要删除的对象在citys中的位置
        }
      })
    }
  });
}

function deletSelectCheckPro(item) {
  this.checkData = this.checkData.filter(i => {
    return i != item
  }),
  this.deletCheckImgShow = false
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
      width: 60%;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      z-index: 1;
      .exportBtn {
        width: 70px;
        height: 40px;
        color: #fff;
        background: #4ab6f4;
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
        background: #4ab6f4;
        transition: background-color .5s;
        margin: 0 0 0 50px
      }
      .showData:hover {
        background-color: rgb(63, 225, 253);
      }
      .tableData {
        width: 100%;
        height: 20%;
        font-size: 14px;
      }
    }
    .rightShowData {
      height: 100%;
      width: 40%;
      margin: 0 10px 0 10px;
      display: inline;
      flex-direction: column;
      flex-wrap: wrap;
      .rightTitle {
        width: 98%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 10px 0 0 10px;
        font-size: 16px;
        border-radius: 5px 5px 0 0;
        color: #fff;
        background-color: #4ab6f4
      }
      .rightTitleTwo {
        width: 97.7%;
        height: 40px;
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-left: 10px;
        color: rgb(70, 68, 68);
        border-left: #eceaea solid 1px;
        border-right: #eceaea solid 1px;
        background-color: #fff
      }
      .exportMode {
        width: 98%;
        height: 40px;
        display: flex;
        align-items: center;
        font-size: 16px;
        color: #fff;
        margin-left: 10px;
        border-radius: 5px 5px 0 0;
        background-color: #4ab6f4
      }
      .edition {
        width: 97.7%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: rgb(70, 68, 68);
        margin-left: 10px;
        border-left: #eceaea solid 1px;
        border-right: #eceaea solid 1px;
        background-color: #fff
      }
      .selectExportItem {
        width: 97.7%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: rgb(70, 68, 68);
        margin-left: 10px;
        border-left: #eceaea solid 1px;
        border-right: #eceaea solid 1px;
        background-color: #fff
      }
      .dataBaseSelect {
        width: 97.7%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        color: rgb(70, 68, 68);
        margin-left: 10px;
        border-left: #eceaea solid 1px;
        border-right: #eceaea solid 1px;
        background-color: #fff
      }
      .sqlSelectItem {
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        color: rgb(70, 68, 68);
        background-color: #fff
      }
    }
  }
}
</style>