!function (global) {
    class PickDate {
        constructor(el, options) {
            this.trigger = el;
            this.options = this.getDefault();
            Object.assign(this.options, options);
            this.init();
        }
        init() {
            if (this.options.column > 3) this.options.column = 3;
            // 创建日期数据
            this.createDateData();
            // 创建html结构
            this.renderBox();
            // 获取传入的pick日期所在位置数组
            this.initPosIdx();
            // 创建日期列表
            this.renderWheels();
            // 获取li高度
            this.options.liHeight = this.options.wheels.querySelector('li').offsetHeight;
            // 滚动到列表到初始位置
            this.setCurDistance();
            // 修正样式
            this.styleOpt();
            // 事件监听
            this.attachEvent();
        }
        setPick(pick) {
            let column = this.options.column;
            let reg = /^\d{4}\/|\-|\.\d{1,2}\/|\-|\.\d{1,2}$/;
            if (column === 1) reg = /^\d{4}\/|\-|\.\d{1,2}$/;
            if (column === 2) reg = /^\d{4}$/;
            if(!reg.test(pick)) return;
            let thePick = new Date(pick);
            if(!this.isInRange(thePick)) return;
            pick = this.handleDate(thePick);
            this.options.resoult = pick;
            this.options.pickPos = this.calcIndex(new Date(pick));
            this.renderWheels();
            this.setCurDistance();
            this.styleOpt();
        }
        attachEvent() {
            let { done, maskBlack, pickBox, cancelBtn, ensureBtn } = this.options;
            cancelBtn.addEventListener('click', () => {
                this.close()
            });
            maskBlack.addEventListener('click', () => {
                this.close()
            });
            this.trigger.addEventListener('click', () => {
                this.open()
            });
            pickBox.addEventListener('click', e => {
                e.stopPropagation();
            })
            ensureBtn.addEventListener('click', () => {
                this.close();
                typeof done == 'function' && done.call(this, this.options.resoult);
            });
            this.attachTouch();
        }
        attachTouch() {
            let sliders = this.options.sliders;
            sliders.forEach((item, idx) => {
                item.addEventListener('touchstart', e => {
                    this.startY = e.touches[0].clientY;
                    this.oldMoveY = this.startY;
                });
                item.addEventListener('touchmove', e => {
                    this.moveY = e.touches[0].clientY;
                    this.moving(idx, item);
                });
                item.addEventListener('touchend', e => {
                    this.moveEndY = e.changedTouches[0].clientY;
                    this.moveEnd(idx, item);
                });
            })
        }
        moving(idx, theSlider) {
            let curDistance = this.options.curDistance;
            this.offset = this.moveY - this.oldMoveY;
            curDistance[idx] = curDistance[idx] + this.offset;
            this.movePosition(theSlider, curDistance[idx]);
            this.oldMoveY = this.moveY;
        }
        moveEnd(idx, theSlider) {
            let { liHeight, pickPos, curDistance } = this.options;
            this.offsetSum = this.moveEndY - this.startY;
            //修正位置
            curDistance[idx] = this.fixPosition(curDistance[idx], liHeight);
            this.movePosition(theSlider, curDistance[idx]);
            let maxlen = -(theSlider.querySelectorAll('li').length - 3) * liHeight,
                minlen = 2 * liHeight,
                distance = curDistance[idx] + this.offsetSum;
            //反弹
            if (distance > minlen) {
                curDistance[idx] = minlen;
                setTimeout(() => {
                    this.movePosition(theSlider, curDistance[idx]);
                }, 100);
            } else if (distance < maxlen) {
                curDistance[idx] = maxlen;
                setTimeout(() => {
                    this.movePosition(theSlider, curDistance[idx]);
                }, 100);
            }
            pickPos[idx] = this.getIndex(curDistance[idx], liHeight);
            this.updateWheel(idx);
            this.styleOpt();
            this.handleResoult();
        }
        handleResoult() {
            let { column, format, sliders, pickPos } = this.options;
            let temp = '';
            for (let i = 0; i < column; i++) {
                let lilist = [].slice.call(sliders[i].querySelectorAll('li'), 0),
                    pos = pickPos[i], val;
                lilist.some((item, idx) => {
                    if (idx == pos) {
                        val = parseInt(item.getAttribute('data-id'));
                        return true;
                    }
                })
                val = (val < 10 ? '0' + val : val);
                i == column - 1 ? temp += val : temp += val + format;
            }
            this.options.resoult = temp;
        }
        updateWheel(idx) {
            let { column, sliders, liHeight, pickPos, curDistance } = this.options;
            let i = idx + 1;
            while (i < column) {
                this.handleCase(i);
                pickPos[i] = 0;
                curDistance[i] = 2 * liHeight;
                this.movePosition(sliders[i], curDistance[i]);
                i++;
            }

        }
        fixPosition(distance, liHeight) {
            return -(this.getIndex(distance, liHeight) - 2) * liHeight;
        }
        getIndex(distance, liHeight) {
            return Math.round((2 * liHeight - distance) / liHeight);
        }
        close() {
            this.options.pickBox.classList.remove('pickDate-show');
            document.querySelector('body').removeChild(this.options.maskBlack);
        }
        open() {
            this.options.pickBox.classList.add('pickDate-show');
            document.querySelector('body').appendChild(this.options.maskBlack);
        }
        styleOpt() {
            let { column, sliders, pickPos } = this.options;
            for (var i = 0; i < column; i++) {
                var liList = [].slice.call(sliders[i].querySelectorAll('li'), 0);
                liList.forEach(item => {
                    item.style.transform = 'scale(0.7)';
                });
                liList[pickPos[i]].style.transform = 'scale(1)';
                if (pickPos[i] > 0) {
                    liList[pickPos[i] - 1].style.transform = 'scale(0.85)';
                }
                if (pickPos[i] < liList.length - 1) {
                    liList[pickPos[i] + 1].style.transform = 'scale(0.85)';
                }
            }
        }
        setCurDistance() {
            let { column, sliders, pickPos, liHeight } = this.options;
            let temp = [];
            for (let i = 0; i < column; i++) {
                temp.push(this.calcDistance(pickPos[i], liHeight));
                this.movePosition(sliders[i], temp[i]);
            }
            this.options.curDistance = temp;
        }
        movePosition(theSlider, distance) {
            theSlider.style.webkitTransform = 'translate3d(0,' + distance + 'px,0)';
            theSlider.style.transform = 'translate3d(0,' + distance + 'px,0)';
        }
        calcDistance(idx, liHeight) {
            return 2 * liHeight - idx * liHeight;
        }
        initPosIdx() {
            let { start, pick } = this.options;
            let theDate;
            if (pick && this.isInRange(new Date(pick))) {
                pick = this.handleDate(new Date(pick));
                theDate = new Date(pick);
                this.options.resoult = pick;
            } else {
                theDate = new Date();
                if (!this.isInRange(theDate)) theDate = new Date(start);
                this.options.resoult = this.handleDate(theDate);
            }
            this.options.pickPos = this.calcIndex(theDate);
        }
        calcIndex(sdate) {
            let { column, weekend, startYear, startMonth, startDay, wheelsData } = this.options;
            let arr = [],
                y = sdate.getFullYear();
            arr.push(y - startYear);
            if (column > 1) {
                let m = sdate.getMonth() + 1;
                y == startYear ? arr.push(m - startMonth) : arr.push(m - 1);
                if (column > 2) {
                    let d = sdate.getDate();
                    if (!weekend) {
                        let dayData = wheelsData[arr[0]].children[arr[1]].children;
                        dayData.forEach((item, idx) => {
                            if (item.value == d) arr.push(idx);
                        })
                    } else {
                        (y == startYear && m == startMonth) ? arr.push(d - startDay) : arr.push(d - 1);
                    }
                }
            }
            return arr;
        }
        handleDate(sdate) {
            let { column, format } = this.options;
            sdate = this.handleWeekend(sdate);
            let res = sdate.getFullYear() + '';
            if (column > 1) {
                let m = sdate.getMonth() + 1;
                m = (m < 10 ? '0' + m : m);
                res += format + m;
                if (column > 2) {
                    let d = sdate.getDate();
                    d = (d < 10 ? '0' + d : d);
                    res += format + d;
                }
            }
            return res;
        }
        handleWeekend(sdate) {
            if (!this.options.weekend) {
                // 处理周末日期，若为周六前置一天，若为周日退后一天
                let num = sdate.getDay();
                num == 6 && (sdate = new Date(sdate.getTime() - 24 * 60 * 60 * 1000));
                num == 0 && (sdate = new Date(sdate.getTime() + 24 * 60 * 60 * 1000));
            }
            return sdate;
        }
        isInRange(pick) {
            // 判断日期是否不在时间段内；
            let { start, end } = this.options;
            return !(pick < new Date(start) || pick > new Date(end));
        }
        renderBox() {
            let { column, title } = this.options;
            let wheelHtml = '', width = (100 / column).toFixed(2);
            let maskBlack = document.createElement("div");
            maskBlack.className = "mask-black";
            let pickBox = document.createElement("div");
            pickBox.className = "pickDate";
            for (let i = 0; i < column; i++) {
                wheelHtml += `<div class="wheel" style="width:${width}%"><ul class="selectContainer"></ul></div>`;
            }
            let boxHtml = `
                <div class="btnBar">
                    <div class="fixWidth">
                        <div class="cancel">取消</div>
                        <div class="title">${title}</div>
                        <div class="ensure">确定</div>
                    </div>
                </div>
                <div class="panel">
                    <div class="fixWidth">
                        <div class="wheels">${wheelHtml}</div>
                        <div class="selectLine"></div>
                        <div class="shadowMask"></div>
                    </div>
                </div>`
            pickBox.innerHTML = boxHtml;
            let cancelBtn = pickBox.querySelector('.cancel'),
                ensureBtn = pickBox.querySelector('.ensure'),
                wheels = pickBox.querySelector('.wheels'),
                sliders = [...wheels.querySelectorAll('.selectContainer')];
            document.querySelector('body').appendChild(pickBox);
            Object.assign(this.options, { maskBlack, pickBox, cancelBtn, ensureBtn, wheels, sliders })
        }
        renderWheels() {
            let column = this.options.column;
            for (let i = 0; i < column; i++) {
                this.handleCase(i)
            } 
        }
        handleCase(i) {
            let { units, wheelsData, sliders, pickPos } = this.options;
            let theul = sliders[i], unit = units[i];
            switch (i) {
                case 0:
                    theul.innerHTML = this.handleCreateLi(wheelsData, unit);
                    break;
                case 1:
                    theul.innerHTML = this.handleCreateLi(wheelsData[pickPos[0]].children, unit);
                    break;
                case 2:
                    theul.innerHTML = this.handleCreateLi(wheelsData[pickPos[0]].children[pickPos[1]].children, unit);
                    break;
            }
        }
        handleCreateLi(arr, unit) {
            let list = '';
            arr.forEach(item => {
                list += `<li data-id="${item.value}">${item.value}${unit}</li>`
            })
            return list;
        }
        createDateData() {
            let { column, weekend, start, end } = this.options;
            let wheelsData = [],
                startDate = new Date(start),
                endDate = new Date(end),
                startYear = startDate.getFullYear(),
                endYear = endDate.getFullYear(),
                startMonth = startDate.getMonth() + 1,
                endMonth = endDate.getMonth() + 1,
                startDay = startDate.getDate(),
                endDay = endDate.getDate();
            for (let x = startYear; x <= endYear; x++) {
                let data = {
                    value: x,
                }
                if (column > 1) {
                    data.children = [];
                    for (let y = 1; y <= 12; y++) {
                        if (x === startYear && y < startMonth) continue;
                        if (x === endYear && y > endMonth) break;
                        if (column > 2) {
                            let dayArr = [];
                            let len = this.calcDayLen(x, y);
                            for (let z = 1; z <= len; z++) {
                                if (x === startYear && y === startMonth && z < startDay) continue;
                                if (x === endYear && y === endMonth && z > endDay) break;
                                if (!weekend) {
                                    let theDay = x + '/' + y + '/' + z;
                                    let num = (new Date(theDay)).getDay();
                                    if (num == 6 || num == 0) continue;
                                }
                                dayArr.push({ value: z })
                            }
                            data.children.push({
                                value: y,
                                children: dayArr
                            })
                        } else {
                            data.children.push({ value: y });
                        }
                    }
                }
                wheelsData.push(data)
            }
            Object.assign(this.options, { startYear, startMonth, startDay, wheelsData });
        }
        calcDayLen(year, month) {
            if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
                return 31;
            } else if (month == 2) {
                if (year % 4 == 0 && year % 100 != 0) {
                    return 29;
                } else if (year % 400 == 0) {
                    return 29;
                } else {
                    return 28;
                }
            } else {
                return 30;
            }
        }
        getDefault() {
            return {
                column: 3,
                weekend: true,
                start: (new Date()).getFullYear() - 50 + '/1/1',
                end: (new Date()).getFullYear() + '/12/31',
                title: '选择日期',
                format: '/',
                pick: '',
                done: function () { },
                units: ['年', '月', '日'],
            }
        }

        // 静态方法 也会被继承
        static sayWhat() {
            return "我是静态方法的sayWhat"
        }

    }
    function testDate(str, column) {
        let reg = /^\d{4}\/|\-|\.\d{1,2}\/|\-|\.\d{1,2}$/;
        if (column === 1) {
            reg = /^\d{4}\/|\-|\.\d{1,2}$/
        }
        if (column === 2) {
            reg = /^\d{4}$/
        }
        return reg.test(str);
    }
    function testOptDate(option) {
        let arr = [option.start, option.end, option.pick];
        let column = option.column;
        return arr.every(item => {
            if (item) {
                return testDate(item, column);
            } else {
                return true;
            }
        })
    }
    function Plugin(el, option) {
        let dom = document.querySelector(el);
        let pickdate = dom.pickdate;
        // 防止针对同一 dom 元素多次 new 实例
        if (!pickdate) {
            if (!testOptDate(option)) return;
            pickdate = dom.pickdate = new PickDate(dom, option);
        }
        return pickdate;
    }

    //兼容CommonJs规范
    if (typeof module !== 'undefined' && module.exports) module.exports = Plugin;

    //兼容AMD/CMD规范
    if (typeof define === 'function') define(function () { return Plugin; });

    // 注册全局变量，兼容直接使用script标签引入该插件
    global.PickDate = Plugin;
}(this)


