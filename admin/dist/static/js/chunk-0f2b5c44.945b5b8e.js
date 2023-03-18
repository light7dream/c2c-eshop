(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-0f2b5c44"],{"124f":function(e,t,n){"use strict";n.d(t,"c",(function(){return a})),n.d(t,"a",(function(){return i})),n.d(t,"d",(function(){return s})),n.d(t,"b",(function(){return u}));var r=n("b775");function a(e){return Object(r["a"])({url:"/admin/rush_schedule/getList",method:"post",data:e})}function i(e){return Object(r["a"])({url:"/admin/rush_schedule/add",method:"post",data:e})}function s(e){return Object(r["a"])({url:"/admin/rush_schedule/update",method:"post",data:e})}function u(e){return Object(r["a"])({url:"/admin/rush_schedule/delete",method:"post",data:e})}},"2a88":function(e,t,n){},4110:function(e,t,n){"use strict";n.r(t);var r=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"app-container"},[n("div",{staticClass:"div-btn"},[n("el-button",{attrs:{type:"primary"},on:{click:e.handleRush}},[e._v("添加抢购场次")]),n("el-button",{attrs:{type:"primary",icon:"el-icon-refresh"},on:{click:function(t){return e.onSyncCommon("schedule")}}},[e._v("推送场次")])],1),n("el-table",{directives:[{name:"loading",rawName:"v-loading",value:e.listLoading,expression:"listLoading"}],staticStyle:{width:"100%","margin-top":"30px"},attrs:{"highlight-current-row":"",data:e.rushes,"row-key":"id",border:""}},[n("el-table-column",{attrs:{align:"center",label:"场次ID",width:"80"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._v(" "+e._s(t.row.id)+" ")]}}])}),n("el-table-column",{attrs:{align:"center","show-overflow-tooltip":!0,label:"抢购场次名称"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._v(" "+e._s(t.row.name)+" ")]}}])}),0==e.bucket_id?n("el-table-column",{attrs:{align:"center","show-overflow-tooltip":!0,label:"所属分仓"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._v(" "+e._s(t.row.bucket_name||"总仓")+" ")]}}],null,!1,70300835)}):e._e(),n("el-table-column",{attrs:{align:"center",label:"开始时间",width:"200"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._v(" "+e._s(t.row.starttime)+" ")]}}])}),n("el-table-column",{attrs:{align:"center",label:"结束时间",width:"200"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._v(" "+e._s(t.row.endtime)+" ")]}}])}),n("el-table-column",{attrs:{align:"center",label:"状态",width:"200"},scopedSlots:e._u([{key:"default",fn:function(t){return[n("el-tag",{attrs:{type:e._f("stateFilter")(t.row.state)}},[e._v(" "+e._s(1==t.row.state?"正常":"暂停")+" ")])]}}])}),n("el-table-column",{attrs:{align:"center",label:"提示",width:"200"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._v(" "+e._s(t.row.tip)+" ")]}}])}),n("el-table-column",{attrs:{align:"center",width:"200",label:"操作"},scopedSlots:e._u([{key:"default",fn:function(t){return[n("el-button",{attrs:{type:"primary",size:"small"},on:{click:function(n){return e.handleEdit(t)}}},[e._v("修改")]),n("el-button",{attrs:{type:"danger",size:"small"},on:{click:function(n){return e.handleDelete(t)}}},[e._v("删除")])]}}])})],1),n("el-dialog",{attrs:{visible:e.dialogVisible,title:"edit"===e.dialogType?"修改抢购场次":"新增抢购场次"},on:{"update:visible":function(t){e.dialogVisible=t}}},[n("el-form",{attrs:{model:e.rush,"label-width":"120px","label-position":"left"}},[n("el-form-item",{attrs:{label:"抢购场次名称"}},[n("el-input",{attrs:{placeholder:"例如：上午 第一场"},model:{value:e.rush.name,callback:function(t){e.$set(e.rush,"name",t)},expression:"rush.name"}})],1),0==e.bucket_id?n("el-form-item",{attrs:{label:"所属分仓"}},[n("el-select",{attrs:{placeholder:"请选择"},model:{value:e.rush.bucket_id,callback:function(t){e.$set(e.rush,"bucket_id",t)},expression:"rush.bucket_id"}},[n("el-option",{attrs:{label:"总仓",value:0}}),e._l(e.bucketSelection,(function(e){return n("el-option",{key:e.uid,attrs:{label:e.bucket_name,value:e.uid}})}))],2)],1):e._e(),n("el-form-item",{attrs:{label:"时间"}},[n("el-time-picker",{attrs:{"is-range":"","value-format":"HH:mm:ss","picker-options":{format:"HH:mm:ss"},"range-separator":"-","start-placeholder":"开始时间","end-placeholder":"结束时间",placeholder:"选择时间范围"},on:{input:e.daterangeChange},model:{value:e.rush.rushTime,callback:function(t){e.$set(e.rush,"rushTime",t)},expression:"rush.rushTime"}})],1),n("el-form-item",{attrs:{label:"状态"}},[n("el-select",{attrs:{placeholder:"请选择"},model:{value:e.rush.state,callback:function(t){e.$set(e.rush,"state",t)},expression:"rush.state"}},e._l(e.stateSelection,(function(e){return n("el-option",{key:e.id,attrs:{label:e.name,value:e.id}})})),1)],1),n("el-form-item",{attrs:{label:"提示文字"}},[n("el-input",{model:{value:e.rush.tip,callback:function(t){e.$set(e.rush,"tip",t)},expression:"rush.tip"}})],1)],1),n("div",{staticStyle:{"text-align":"right"}},[n("el-button",{attrs:{type:"danger"},on:{click:function(t){e.dialogVisible=!1}}},[e._v("取消")]),n("el-button",{attrs:{type:"primary"},on:{click:e.confirmNotice}},[e._v("确认")])],1)],1)],1)},a=[],i=n("1da1"),s=n("5530"),u=(n("96cf"),n("4de4"),n("d3b7"),n("a434"),n("99af"),n("b0c0"),n("2ef0")),c=n.n(u),o=n("124f"),l=n("51af"),d=n("dd81"),h=n("2f62"),f={id:0,name:"",rushTime:[]},m={filters:{stateFilter:function(e){return 0==e?"warning":1==e?"success":void 0}},data:function(){return{listLoading:!0,rushes:[],rush:Object.assign({},f),dialogVisible:!1,dialogType:"new",bucketSelection:[],stateSelection:[{id:1,name:"正常"},{id:0,name:"暂停"}]}},computed:Object(s["a"])({},Object(h["b"])(["bucket_id"])),created:function(){this.getList(),this.getBucketList()},methods:{getList:function(){var e=this;return Object(i["a"])(regeneratorRuntime.mark((function t(){var n;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return e.listLoading=!0,t.next=3,Object(o["c"])();case 3:n=t.sent,0!=e.bucket_id?e.rushes=n.data.filter((function(t){return t.bucket_id==e.bucket_id})):e.rushes=n.data,e.listLoading=!1;case 6:case"end":return t.stop()}}),t)})))()},getBucketList:function(){var e=this;return Object(i["a"])(regeneratorRuntime.mark((function t(){var n;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return t.next=2,Object(l["c"])();case 2:n=t.sent,e.bucketSelection=n.data;case 4:case"end":return t.stop()}}),t)})))()},onSyncCommon:function(e){var t=this;return Object(i["a"])(regeneratorRuntime.mark((function n(){var r;return regeneratorRuntime.wrap((function(n){while(1)switch(n.prev=n.next){case 0:return n.next=2,Object(d["c"])({key:e});case 2:r=n.sent,t.$message({message:r.msg,type:r.res_code>0?"success":"error"});case 4:case"end":return n.stop()}}),n)})))()},handleRush:function(){this.rush=Object.assign({bucket_id:this.bucket_id},f),this.dialogType="new",this.dialogVisible=!0},handleEdit:function(e){this.dialogType="edit",this.dialogVisible=!0,this.rush=c.a.cloneDeep(e.row),this.rush.rushTime=[this.rush.starttime,this.rush.endtime]},handleDelete:function(e){var t=this,n=e.$index,r=e.row;this.$confirm("确定删除当前抢购场次?不可恢复！","警告",{confirmButtonText:"删除",cancelButtonText:"取消",type:"warning"}).then(Object(i["a"])(regeneratorRuntime.mark((function e(){return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,Object(o["b"])({id:r.id});case 2:t.rushes.splice(n,1),t.$message({type:"success",message:"删除成功!"});case 4:case"end":return e.stop()}}),e)})))).catch((function(e){console.error(e)}))},confirmNotice:function(){var e=this;return Object(i["a"])(regeneratorRuntime.mark((function t(){var n,r,a,i,s,u,c;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(n="edit"===e.dialogType,!n){t.next=22;break}return e.rush.starttime=e.rush.rushTime[0],e.rush.endtime=e.rush.rushTime[1],t.next=6,Object(o["d"])(e.rush);case 6:if(r=t.sent,a=r.res_code,r.data,!(a>0)){t.next=20;break}i=0;case 11:if(!(i<e.rushes.length)){t.next=18;break}if(e.rushes[i].id!==e.rush.id){t.next=15;break}return e.rushes.splice(i,1,Object.assign({},e.rush)),t.abrupt("break",18);case 15:i++,t.next=11;break;case 18:e.dialogVisible=!1,e.$notify({title:"成功",dangerouslyUseHTMLString:!0,message:"\n                    <div>抢购场次id: ".concat(e.rush.id,"</div>\n                    <div>抢购场次: ").concat(e.rush.name,"</div>\n                "),type:"success"});case 20:t.next=30;break;case 22:return e.rush.starttime=e.rush.rushTime[0],e.rush.endtime=e.rush.rushTime[1],t.next=26,Object(o["a"])(e.rush);case 26:s=t.sent,u=s.res_code,c=s.data,u>0&&(e.rush.id=c,e.rushes.push(e.rush),e.dialogVisible=!1,e.$notify({title:"成功",dangerouslyUseHTMLString:!0,message:"\n                    <div>抢购场次id: ".concat(e.rush.id,"</div>\n                    <div>抢购场次: ").concat(e.rush.name,"</div>\n                "),type:"success"}));case 30:e.getList();case 31:case"end":return t.stop()}}),t)})))()},daterangeChange:function(e){var t=this;console.log(e),t.$nextTick((function(){t.$set(t.rush,"rushTime",[e[0],e[1]]),t.$forceUpdate()}))}}},b=m,p=(n("83ae"),n("2877")),g=Object(p["a"])(b,r,a,!1,null,"7ccb3f82",null);t["default"]=g.exports},"51af":function(e,t,n){"use strict";n.d(t,"c",(function(){return a})),n.d(t,"a",(function(){return i})),n.d(t,"b",(function(){return s})),n.d(t,"d",(function(){return u}));var r=n("b775");function a(e){return Object(r["a"])({url:"/admin/user_bucket/getBucketList",method:"post",data:e})}function i(e){return Object(r["a"])({url:"/admin/user_bucket/createBucket",method:"post",data:e})}function s(e){return Object(r["a"])({url:"/admin/user_bucket/deleteBucket",method:"post",data:e})}function u(e){return Object(r["a"])({url:"/admin/user_bucket/getBucketMembers",method:"post",data:e})}},"83ae":function(e,t,n){"use strict";n("2a88")},a434:function(e,t,n){"use strict";var r=n("23e7"),a=n("23cb"),i=n("a691"),s=n("50c4"),u=n("7b0b"),c=n("65f0"),o=n("8418"),l=n("1dde"),d=n("ae40"),h=l("splice"),f=d("splice",{ACCESSORS:!0,0:0,1:2}),m=Math.max,b=Math.min,p=9007199254740991,g="Maximum allowed length exceeded";r({target:"Array",proto:!0,forced:!h||!f},{splice:function(e,t){var n,r,l,d,h,f,k=u(this),v=s(k.length),_=a(e,v),w=arguments.length;if(0===w?n=r=0:1===w?(n=0,r=v-_):(n=w-2,r=b(m(i(t),0),v-_)),v+n-r>p)throw TypeError(g);for(l=c(k,r),d=0;d<r;d++)h=_+d,h in k&&o(l,d,k[h]);if(l.length=r,n<r){for(d=_;d<v-r;d++)h=d+r,f=d+n,h in k?k[f]=k[h]:delete k[f];for(d=v;d>v-r+n;d--)delete k[d-1]}else if(n>r)for(d=v-r;d>_;d--)h=d+r-1,f=d+n-1,h in k?k[f]=k[h]:delete k[f];for(d=0;d<n;d++)k[d+_]=arguments[d+2];return k.length=v-r+n,l}})},dd81:function(e,t,n){"use strict";n.d(t,"d",(function(){return a})),n.d(t,"e",(function(){return i})),n.d(t,"a",(function(){return s})),n.d(t,"b",(function(){return u})),n.d(t,"c",(function(){return c}));var r=n("b775");function a(e){return Object(r["a"])({url:"/admin/sync/syncRush",method:"post",data:e})}function i(e){return Object(r["a"])({url:"/admin/sync/syncShelves",method:"post",data:e})}function s(e){return Object(r["a"])({url:"/admin/sync/celarAllUserBlackList",method:"post",data:e})}function u(e){return Object(r["a"])({url:"/admin/sync/clearAllUserPrivilege",method:"post",data:e})}function c(e){return Object(r["a"])({url:"/admin/sync/syncCommon",method:"post",data:e})}}}]);