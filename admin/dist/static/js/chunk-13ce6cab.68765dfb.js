(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-13ce6cab"],{"02cf":function(t,e,n){},"228d":function(t,e,n){},3762:function(t,e,n){"use strict";n("228d")},5278:function(t,e,n){"use strict";n("02cf")},"579b":function(t,e,n){},"728f":function(t,e,n){"use strict";n.r(e);var i=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"p-page"},[n("div",{staticClass:"ptotocol-name"},[n("span",[t._v(t._s(t.name))]),n("el-button",{staticClass:"btn-save",attrs:{type:"danger",size:"mini"},on:{click:t.onUpdateProtocol}},[t._v(" 更新 ")])],1),n("div",[n("tinymce",{attrs:{height:400},model:{value:t.content,callback:function(e){t.content=e},expression:"content"}})],1),t._m(0),n("div",{staticClass:"editor-content",domProps:{innerHTML:t._s(t.content)}})])},o=[function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"ptotocol-name"},[n("span",[t._v("协议预览")])])}],a=n("1da1"),s=(n("96cf"),n("b0c0"),function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"tinymce-container",class:{fullscreen:t.fullscreen},style:{width:t.containerWidth}},[n("textarea",{staticClass:"tinymce-textarea",attrs:{id:t.tinymceId}}),t._v(" "),n("div",{staticClass:"editor-custom-btn-container"},[n("editorImage",{staticClass:"editor-upload-btn",attrs:{color:"#1890ff"},on:{successCBK:t.imageSuccessCBK}})],1)])}),c=[],r=(n("b680"),n("a9e3"),n("ac1f"),n("00b4"),n("d3b7"),n("159b"),function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"upload-container"},[n("el-button",{style:{background:t.color,borderColor:t.color},attrs:{icon:"el-icon-upload",size:"mini",type:"primary"},on:{click:function(e){t.dialogVisible=!0}}},[t._v(" upload ")]),n("el-dialog",{attrs:{visible:t.dialogVisible},on:{"update:visible":function(e){t.dialogVisible=e}}},[n("el-upload",{staticClass:"editor-slide-upload",attrs:{multiple:!0,"file-list":t.fileList,"show-file-list":!0,"on-remove":t.handleRemove,"on-success":t.handleSuccess,"before-upload":t.beforeUpload,action:"https://httpbin.org/post","list-type":"picture-card"}},[n("el-button",{attrs:{size:"small",type:"primary"}},[t._v(" Click upload ")])],1),n("el-button",{on:{click:function(e){t.dialogVisible=!1}}},[t._v(" Cancel ")]),n("el-button",{attrs:{type:"primary"},on:{click:t.handleSubmit}},[t._v(" Confirm ")])],1)],1)}),l=[],u=(n("b64b"),n("d81d"),n("3ca3"),n("ddb0"),n("2b3d"),n("9861"),{name:"EditorSlideUpload",props:{color:{type:String,default:"#1890ff"}},data:function(){return{dialogVisible:!1,listObj:{},fileList:[]}},methods:{checkAllSuccess:function(){var t=this;return Object.keys(this.listObj).every((function(e){return t.listObj[e].hasSuccess}))},handleSubmit:function(){var t=this,e=Object.keys(this.listObj).map((function(e){return t.listObj[e]}));this.checkAllSuccess()?(this.$emit("successCBK",e),this.listObj={},this.fileList=[],this.dialogVisible=!1):this.$message("Please wait for all images to be uploaded successfully. If there is a network problem, please refresh the page and upload again!")},handleSuccess:function(t,e){for(var n=e.uid,i=Object.keys(this.listObj),o=0,a=i.length;o<a;o++)if(this.listObj[i[o]].uid===n)return this.listObj[i[o]].url=t.files.file,void(this.listObj[i[o]].hasSuccess=!0)},handleRemove:function(t){for(var e=t.uid,n=Object.keys(this.listObj),i=0,o=n.length;i<o;i++)if(this.listObj[n[i]].uid===e)return void delete this.listObj[n[i]]},beforeUpload:function(t){var e=this,n=window.URL||window.webkitURL,i=t.uid;return this.listObj[i]={},new Promise((function(o,a){var s=new Image;s.src=n.createObjectURL(t),s.onload=function(){e.listObj[i]={hasSuccess:!1,uid:t.uid,width:this.width,height:this.height}},o(!0)}))}}}),d=u,h=(n("5278"),n("2877")),m=Object(h["a"])(d,r,l,!1,null,"3dae379b",null),f=m.exports,p=["advlist anchor autolink autosave code codesample colorpicker colorpicker contextmenu directionality emoticons fullscreen hr image imagetools insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print save searchreplace spellchecker tabfocus table template textcolor textpattern visualblocks visualchars wordcount"],b=p,g=["searchreplace bold italic underline strikethrough alignleft aligncenter alignright outdent indent  blockquote undo redo removeformat subscript superscript code codesample","hr bullist numlist link image charmap preview anchor pagebreak insertdatetime media table emoticons forecolor backcolor fullscreen"],y=g,v=n("b85c"),w=[];function _(){return window.tinymce}var k=function(t,e){var n=document.getElementById(t),i=e||function(){};if(!n){var o=document.createElement("script");o.src=t,o.id=t,document.body.appendChild(o),w.push(i);var a="onload"in o?s:c;a(o)}function s(e){e.onload=function(){this.onerror=this.onload=null;var t,n=Object(v["a"])(w);try{for(n.s();!(t=n.n()).done;){var i=t.value;i(null,e)}}catch(o){n.e(o)}finally{n.f()}w=null},e.onerror=function(){this.onerror=this.onload=null,i(new Error("Failed to load "+t),e)}}function c(t){t.onreadystatechange=function(){if("complete"===this.readyState||"loaded"===this.readyState){this.onreadystatechange=null;var e,n=Object(v["a"])(w);try{for(n.s();!(e=n.n()).done;){var i=e.value;i(null,t)}}catch(o){n.e(o)}finally{n.f()}w=null}}}n&&i&&(_()?i(null,n):w.push(i))},C=k,j="./tinymce/tinymce.min.js",O={name:"Tinymce",components:{editorImage:f},props:{id:{type:String,default:function(){return"vue-tinymce-"+ +new Date+(1e3*Math.random()).toFixed(0)}},value:{type:String,default:""},toolbar:{type:Array,required:!1,default:function(){return[]}},menubar:{type:String,default:"file edit insert view format table"},height:{type:[Number,String],required:!1,default:360},width:{type:[Number,String],required:!1,default:"auto"}},data:function(){return{hasChange:!1,hasInit:!1,tinymceId:this.id,fullscreen:!1,languageTypeList:{en:"en",zh:"zh_CN",es:"es_MX",ja:"ja"}}},computed:{containerWidth:function(){var t=this.width;return/^[\d]+(\.[\d]+)?$/.test(t)?"".concat(t,"px"):t}},watch:{value:function(t){var e=this;!this.hasChange&&this.hasInit&&this.$nextTick((function(){return window.tinymce.get(e.tinymceId).setContent(t||"")}))}},mounted:function(){this.init()},activated:function(){window.tinymce&&this.initTinymce()},deactivated:function(){this.destroyTinymce()},destroyed:function(){this.destroyTinymce()},methods:{init:function(){var t=this;C(j,(function(e){e?t.$message.error(e.message):t.initTinymce()}))},initTinymce:function(){var t=this,e=this;window.tinymce.init({selector:"#".concat(this.tinymceId),language:this.languageTypeList["en"],height:this.height,body_class:"panel-body ",object_resizing:!1,toolbar:this.toolbar.length>0?this.toolbar:y,menubar:this.menubar,plugins:b,end_container_on_empty_block:!0,powerpaste_word_import:"clean",code_dialog_height:450,code_dialog_width:1e3,advlist_bullet_styles:"square",advlist_number_styles:"default",imagetools_cors_hosts:["www.tinymce.com","codepen.io"],default_link_target:"_blank",link_title:!1,nonbreaking_force_tab:!0,init_instance_callback:function(n){e.value&&n.setContent(e.value),e.hasInit=!0,n.on("NodeChange Change KeyUp SetContent",(function(){t.hasChange=!0,t.$emit("input",n.getContent())}))},setup:function(t){t.on("FullscreenStateChanged",(function(t){e.fullscreen=t.state}))},convert_urls:!1})},destroyTinymce:function(){var t=window.tinymce.get(this.tinymceId);this.fullscreen&&t.execCommand("mceFullScreen"),t&&t.destroy()},setContent:function(t){window.tinymce.get(this.tinymceId).setContent(t)},getContent:function(){window.tinymce.get(this.tinymceId).getContent()},imageSuccessCBK:function(t){var e=this;t.forEach((function(t){return window.tinymce.get(e.tinymceId).insertContent('<img class="wscnph" src="'.concat(t.url,'" >'))}))}}},S=O,x=(n("3762"),Object(h["a"])(S,s,c,!1,null,"872d64f8",null)),I=x.exports,T=n("b775");function $(t){return Object(T["a"])({url:"/admin/protocol/getProtocol",method:"post",data:t})}function E(t){return Object(T["a"])({url:"/admin/protocol/updateProtocol",method:"post",data:t})}var L={name:"ProtocalPage",components:{Tinymce:I},data:function(){return{pid:0,content:"",name:"暂未获取到协议..."}},created:function(){var t=this;return Object(a["a"])(regeneratorRuntime.mark((function e(){var n;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return t.pid=t.$route.meta.pid,e.next=3,$({pid:t.pid});case 3:n=e.sent,n.res_code>0&&(t.name=n.data.name,t.content=n.data.content);case 5:case"end":return e.stop()}}),e)})))()},methods:{onUpdateProtocol:function(){var t=this;return Object(a["a"])(regeneratorRuntime.mark((function e(){var n;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,E({pid:t.pid,content:t.content});case 2:n=e.sent,t.$message({message:n.msg,type:n.res_code>0?"success":"danger"});case 4:case"end":return e.stop()}}),e)})))()}}},P=L,R=(n("9e92"),Object(h["a"])(P,i,o,!1,null,"2d843199",null));e["default"]=R.exports},"9e92":function(t,e,n){"use strict";n("579b")}}]);