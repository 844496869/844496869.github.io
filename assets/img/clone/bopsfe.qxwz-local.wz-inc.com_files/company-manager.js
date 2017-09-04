"use strict";

$app.prop.modalPage.companyManager.ready(function () {
    this._pageConfig.$container.html($("#companyManagerContainerTemplate").html());
    var self = new Vue({
        el: ".company-manager-container",
        data: function data() {
            return {
                form: {
                    phone: "",
                    email: "",
                    orderNo: "",
                    dateRange: ""
                },
                tabActiveName: "displayForm",
                tabDisplayPanel: {
                    displayForm: "",
                    displayLogForm: "hidden"
                },
                tableData: [],
                pagination: {
                    total: 0,
                    pageSize: 20,
                    currentPage: 1,
                    pageSizeRange: [10, 20, 50, 100]
                },
                logForm: {
                    orderNo: "",
                    phone: "",
                    operator: ""
                },
                logTableData: [],
                logPagination: {
                    total: 0,
                    pageSize: 20,
                    currentPage: 1,
                    pageSizeRange: [10, 20, 50, 100]
                },
                displaySureAgainVisible: false,
                paymentStatusMapping: {
                    1: "支付宝收款",
                    2: "银行收款"
                },
                paymentTypeMapping: {
                    1: "新购订单",
                    2: "续费订单",
                    3: "兑换码续费订单",
                    4: "兑换码新购订单",
                    5: "试用订单",
                    6: "迁移订单",
                    7: "批量续费订单"
                },
                confirmMessage: '',
                shouldUpdateRow: {}
            };
        },
        methods: {
            updatePrice: function updatePrice(row, next) {
                var _this = this;

                var form = (row.orderDetail.goodsList || []).map(function (item) {
                    return {
                        orderGoodsId: item.id, num: item.numAfter
                    };
                });
                $app.pipe("company-manager.do", {
                    type: "priceChange",
                    orderId: row.id,
                    approvalNo: row.priceForm.approvalNo,
                    priceAfter: row.priceForm.priceAfter,
                    orderNo: row.orderNo,
                    goodsNums: form
                }, "POST").then(function (rtn) {
                    if (rtn.code == 200) {
                        _this.$message('更新价格成功');
                        typeof next === 'function' && next(row);
                    } else {
                        _this.$message.error('更新价格失败');
                    }
                });
                $app.ajaxSendPost("/v1/trade/order/" + row.id + "/price.rpc", { approvalNo: row.priceForm.approvalNo,
                    priceAfter: row.priceForm.priceAfter, goodsNums: form }, function (rtn) {
                    console.log(rtn);
                });
            },
            showDetail: function showDetail(row, expanded) {
                var _this2 = this;

                if (expanded) {
                    $app.pipe('company-manager.do', {
                        orderNo: row.orderNo,
                        type: 'getOrderDetail'
                    }, 'post').then(function (rtn) {
                        console.log(rtn.data);
                        var orderDetail = rtn.data || {};
                        orderDetail.orderNo = row.orderNo;
                        orderDetail.paymentStatusDesc = _this2.paymentStatusMapping[orderDetail.paymentStatus];
                        orderDetail.paymentTypeDesc = _this2.paymentTypeMapping[orderDetail.paymentType];
                        orderDetail.goodsList.forEach(function (v) {
                            return v.numAfter = v.num;
                        });
                        row.orderDetail = orderDetail;
                    });
                    this.displaySureAgainVisible = false;
                }
            },
            logSearch: function logSearch() {
                var _this3 = this;

                $app.pipe("company-manager.do", $.extend({
                    type: "getLogList",
                    pageNo: this.logPagination.currentPage,
                    pageSize: this.logPagination.pageSize
                }, this.logForm), "post").then(function (rtn) {
                    _this3.logTableData = rtn.data && rtn.data.content || [];
                    _this3.logPagination.total = rtn.data && rtn.data.totalElements || 0;
                });
                return this;
            },
            search: function search() {
                var _this4 = this;

                this.displaySureAgainVisible = false;
                $app.pipe("company-manager.do", $.extend({
                    type: "getList",
                    pageNo: this.pagination.currentPage,
                    pageSize: this.pagination.pageSize,
                    orderCreateTimeStart: +new Date(this.form.dateRange[0]) || undefined,
                    orderCreateTimeEnd: +new Date(this.form.dateRange[1]) || undefined
                }, this.form), "GET").then(function (rtn) {
                    var extended = (rtn.data && rtn.data.content || []).map(function (item) {
                        item.orderDetail = {
                            orderNo: item.orderNo,
                            createTime: '',
                            payDeadline: '',
                            paymentStatusDesc: '',
                            paymentTypeDesc: '',
                            goodsList: []
                        };
                        item.priceForm = {
                            needAgree: false,
                            priceAfter: '',
                            approvalNo: ''
                        };
                        item.activeNames = ['basic', 'detail'];
                        return item;
                    });
                    _this4.tableData = extended;
                    _this4.pagination.total = rtn.data && rtn.data.totalElements || 0;
                });
                return this;
            },
            pageChange: function pageChange(num) {
                this.pagination.currentPage = num;
                this.search();
            },
            sizeChange: function sizeChange(num) {
                this.pagination.pageSize = num;
                this.search();
            },
            logPageChange: function logPageChange(num) {
                this.logPagination.currentPage = num;
                this.logSearch();
            },
            logSizeChange: function logSizeChange(num) {
                this.logPagination.pageSize = num;
                this.logSearch();
            },
            tabChange: function tabChange() {
                for (var a in this.tabDisplayPanel) {
                    this.tabDisplayPanel[a] = a === this.tabActiveName ? "" : "hidden";
                }
            },
            updateOrderInfo: function updateOrderInfo(row) {
                var updatePrice = row.priceForm.priceAfter;
                var updateOrderGoodsNum = row.orderDetail && row.orderDetail.goodsList && row.orderDetail.goodsList.find(function (item) {
                    return item.num != item.numAfter;
                });

                if (updatePrice) {
                    if (!row.priceForm.needAgree && !row.priceForm.approvalNo) {
                        this.$message.error('请输入审批单号');
                        return;
                    } else if (row.priceForm.needAgree) {
                        row.priceForm.approvalNo = "";
                    }
                }

                if (updatePrice || updateOrderGoodsNum) {
                    this.confirmMessage = "\u60A8\u786E\u5B9A\u8981\u66F4\u65B0 " + (updatePrice ? '价格' : '') + " " + (updateOrderGoodsNum ? '数量' : '') + " \u561B\uFF1F";
                    this.shouldUpdateRow = row;
                    this.displaySureAgainVisible = true;
                } else {
                    this.$message.error('请输入要更新的值');
                };
            },
            priceChangeSure: function priceChangeSure() {
                var updatePrice = this.shouldUpdateRow.priceForm.priceAfter;
                var updateOrderGoodsNum = this.shouldUpdateRow.orderDetail && this.shouldUpdateRow.orderDetail.goodsList && this.shouldUpdateRow.orderDetail.goodsList.find(function (item) {
                    return item.num != item.numAfter;
                });

                if (updatePrice || updateOrderGoodsNum) {
                    this.updatePrice(this.shouldUpdateRow, updateOrderGoodsNum ? this.updateBatchOrderGoodsNumber : this.search);
                }
            },

            formatDate: $pages.util.formatDate,
            formatMonthAndDay: $pages.util.formatMonthAndDay
        }
    });
    self.search();
    return self;
});
//# sourceMappingURL=company-manager.js.map
