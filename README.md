# 手机端时间选择插件dqp-pickDate

直接下载即可使用，插件没有依赖，用原声 javascript 写的，用到了部分 es6 的语法，如果对里面的一些 es6 语法不了解，可以查阅阮老师的 [es6入门](http://es6.ruanyifeng.com/)。

这个是手机端的时间选择插件，支持选择年份、年月、年月日三种模式效果请使用手机模式查看，不支持 pc 端，如果想要支持 pc 端，可以参考源码中的 touch 事件，绑定相应的 mousedown,mousemove,mouseup 等事件就可以实现。

以下说明中关于字符串的日期格式支持三种：'YYYY/MM/DD' 'YYYY-MMM-DD' 'YYYY.MM.DD'

## 参数介绍
+ start: String 可选时间段开始时间，不传默认当前时间往前50年；
+ end: String 可选时间段结束时间，不传默认当前时间；
+ pick: String 初始化默认选中时间，不传默认当前时间，如果当前时间不在可选时间段内，默认时间段开始时间；
+ weekend: boolean 值，表示是否去除可选时间段的周末日期，true 表示不去除， false 表示去除，默认为 true；
+ format: String 日期字符串的组合格式，值可以是 '-' 或 '/' 或 '.' ,默认为 '/' ；
+ title: String 弹窗标题
+ column: Number 值为1-3，值为 1 表示选择年份，值为 2 表示 选择年月，值为 3 表示选择年月日；
+ done: function（response） 用户选择完毕，点击完成后执行的回调函数， 参数 response 的值为用户所选的日期；

## 方法介绍

+ open() : 打开弹窗；
+ close() : 关闭弹窗；
+ setPick(pick) : 添加或修改默认选择值， 参数 pick 为 String 格式，表示传入的日期；
