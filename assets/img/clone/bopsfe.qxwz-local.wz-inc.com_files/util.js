"use strict";

require(["ModalView"], function (ModalView) {
    $app.prop.modalPage.util.ready(function () {
        var self = new ModalView("app", $("body"), function () {
            this.initDialog();
            //                .initNotice();
        }, {
            dialog: false
        });
        self.addModalEvent({
            initDialog: function initDialog() {
                this.prop.dialog = new Vue({
                    el: "#commonDialog",
                    data: function data() {
                        return {
                            dialogVisible: false,
                            successFn: Function,
                            cancelFn: Function,
                            message: ""
                        };
                    },
                    methods: {
                        cancel: function cancel() {
                            this.dialogVisible = false;
                        },
                        success: function success() {
                            if (typeof this.successFn == "function" && this.successFn() === false) {
                                this.dialogVisible = true;
                            } else {
                                this.dialogVisible = false;
                            }
                        }
                    }
                });
                return this;
            }
        }).addViewEvent({}).init();
        return {
            sidebar: function sidebar(name) {
                $app.prop.sideBar.activeBar = "";
                window.setTimeout(function () {
                    $app.prop.sideBar.activeBar = name;
                }, 1e1);
            },
            filterNullValue: function filterNullValue(obj) {
                Object.keys(obj).map(function (k) {
                    if (obj[k] == -1) {
                        delete obj[k];
                    }
                });
                return obj;
            },
            formatDate: function formatDate(str) {
                if (!str) {
                    return "";
                }
                var _date = new Date(str),
                    _Y = _date.getFullYear(),
                    _M = _date.getMonth() + 1,
                    _d = _date.getDate(),
                    _h = _date.getHours(),
                    _m = _date.getMinutes();
                _M = _M >= 10 ? _M : "0" + _M;
                _d = _d >= 10 ? _d : "0" + _d;
                _h = _h >= 10 ? _h : "0" + _h;
                _m = _m >= 10 ? _m : "0" + _m;
                return [_Y, _M, _d].join("-") + " " + [_h, _m].join(":");
            },

            formatMonthAndDay: function formatMonthAndDay(month, day) {
                var str = [];
                if (month) {
                    str.push(month + "\u4E2A\u6708");
                }

                if (day) {
                    str.push(day + "\u5929");
                }

                return str.join('-');
            },
            notice: self.prop.dialog.$notify,
            dialog: function dialog(message, successFn, cancelFn) {
                self.prop.dialog.dialogVisible = true;
                self.prop.dialog.message = message;
                self.prop.dialog.successFn = successFn;
                self.prop.dialog.cancelFn = cancelFn;
            },
            formatMoney: function formatMoney(value, num) {
                value = value ? value : 0;
                num = num > 0 && num <= 20 ? num : 2;
                value = parseFloat((value + "").replace(/[^\d\.-]/g, "")).toFixed(num) + "";
                var left = value.split(".")[0].split("").reverse(),
                    right = value.split(".")[1];
                var t = "";
                for (var i = 0; i < left.length; i++) {
                    t += left[i] + ((i + 1) % 3 == 0 && i + 1 != left.length ? "," : "");
                }
                return "￥ " + t.split("").reverse().join("") + "." + right;
            }
        };
    });
});
//# sourceMappingURL=util.js.map
