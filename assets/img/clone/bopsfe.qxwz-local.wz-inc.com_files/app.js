"use strict";

require(["ModalView", "ModalPage", "UrlHash"], function (ModalView, ModalPage, UrlHash) {
    var self = new ModalView("app", $("body"), function () {
        this.initModalPage().initHeaderBar().initSideBar();
    }, {
        headerBar: false,
        sideBar: false,
        modalPage: false,
        loading: new Vue().$loading,
        loadingInstances: []
    });
    self.addModalEvent({
        gotoPage: function gotoPage() {
            var _url = new UrlHash().getHash(true),
                _page = this.prop.modalPage[_url.to] || this.prop.modalPage.companyManager;
            _page.display(function () {
                if (_url.to === "userDetail" && _url.userId) {
                    _page.displayOrderDetail(_url.userId, _url.orderNo);
                }
            });
            return this;
        },
        initModalPage: function initModalPage() {
            var _this = this;

            this.prop.modalPage = new ModalPage("app", $(".container-body"), {
                companyManager: "js/company-manager.js",
                memberSearch: "js/member-search.js",
                deviceNoSearch: "js/device-no-search.js",
                userDetail: "js/user-detail.js",
                inviteSearch: "js/invite-search.js",
                serverInstanceManager: "js/server-instance-manager.js",
                serverInstanceManagerForMember: "js/server-instance-manager-for-member.js",
                serverInstanceDetail: "js/server-instance-detail.js",
                messageManager: "js/message-manager.js",
                messageUesrLogs: "js/message-uesr-logs.js",
                productPriceManager: "js/product-price-manager.js",
                productPriceDetail: "js/product-price-detail.js",
                home: "js/home.js",
                util: "js/util.js",
                orderDealManager: "js/order-deal-manager.js",
                orderDealDetail: "js/order-deal-detail.js",
                orderCard: "js/order-card.js"
            });
            window.$pages = this.prop.modalPage;
            this.prop.modalPage.addAfterDisplayEvent(function (name) {
                var urlStr = [],
                    hash = new UrlHash().getHash(true);
                self.prop.sideBar.activeBar = name;
                hash.to = name;
                for (var a in hash) {
                    urlStr.push(a + "=" + hash[a]);
                }
                window.history.pushState({}, name, "#" + urlStr.join("&"));
            });
            window.onpopstate = function () {
                self.gotoPage();
                return false;
            };
            this.prop.modalPage.util.get(function () {
                _this.gotoPage();
            });
            return this;
        },
        initHeaderBar: function initHeaderBar() {
            self.prop.headerBar = new Vue({
                el: ".header-container",
                data: function data() {
                    return {
                        pageNameList: []
                    };
                },
                methods: {}
            });
            return this;
        },
        initSideBar: function initSideBar() {
            var _titleMap = {};
            self.prop.sideBar = new Vue({
                el: ".sidebar-container",
                data: function data() {
                    return {
                        "openeds": ["2"],
                        activeBar: "companyManager",
                        menus: [{
                            index: '1',
                            title: '会员管理',
                            subMenus: [{
                                index: 'memberSearch',
                                title: '官网会员查询'
                            }, {
                                index: 'deviceNoSearch',
                                title: '差分账号-设备号查询'
                            }, {
                                index: 'inviteSearch',
                                title: '邀请注册排行'
                            }]
                        }, {
                            index: '2',
                            title: '大客户',
                            subMenus: [{
                                index: 'companyManager',
                                title: '订单调价'
                            }, {
                                index: 'orderCard',
                                title: '大客户下单'
                            }]
                        }, {
                            index: '3',
                            title: '订单交易',
                            subMenus: [{
                                index: 'serverInstanceManager',
                                title: '服务实例查询'
                            }, {
                                index: 'orderDealManager',
                                title: '订单交易查询'
                            }]
                        },
                        //                            {
                        //                                index    : '4' ,
                        //                                title    : '消息管理' ,
                        //                                subMenus : [
                        //                                    {
                        //                                        index : 'messageUesrLogs' ,
                        //                                        title : '用户消息日志'
                        //                                                                        } ,
                        //                                    {
                        //                                        index : 'messageManager' ,
                        //                                        title : '消息模板列表'
                        //                                    }
                        //                                ]
                        //                            },
                        {
                            index: '5',
                            title: '商品定价',
                            subMenus: [{
                                index: 'productPriceManager',
                                title: '商品定价管理'
                            }]
                        }]
                    };
                },
                methods: {
                    select: function select(key, keyPath) {
                        $pages[key] && $pages[key].display && $pages[key].display();
                    }
                }
            });
            this.prop.sideBar.menus.map(function (v) {
                v.subMenus.map(function (menu) {
                    _titleMap[menu.index] = [v.title, menu.title];
                });
            });
            this.prop.modalPage.addAfterDisplayEvent(function (name) {
                if (_titleMap[name]) {
                    self.prop.headerBar.pageNameList = _titleMap[name];
                    self.prop.sideBar.activeBar = name;
                    window.history.pushState({}, name, "#to=" + name);
                }
            });
            return this;
        }
    }).addViewEvent({}).setAjaxConfig({
        beforeList: function beforeList() {
            self.prop.loadingInstances.push(self.prop.loading && self.prop.loading({ target: '.container-body', text: '拼命加载中', lock: false }));

            for (var a in this.data) {
                if (this.data[a] == -1) {
                    delete this.data[a];
                } else if (this.data[a] === "") {
                    this.data[a] = undefined;
                }
            }
        },
        successList: function successList(rst) {
            var loadingInstance = self.prop.loadingInstances.shift();
            loadingInstance && loadingInstance.close();
            if (rst.code && rst.code == 302) {
                window.location.href = rst.data.loginUrl + encodeURIComponent(window.location.href);
            }
        },
        errorList: function errorList(rst) {
            var loadingInstance = self.prop.loadingInstances.shift();
            loadingInstance && loadingInstance.close();
        },
        failList: function failList() {
            var loadingInstance = self.prop.loadingInstances.shift();
            loadingInstance && loadingInstance.close();
        }
    }, true).init();
    window.$app = self;
});
//# sourceMappingURL=app.js.map
