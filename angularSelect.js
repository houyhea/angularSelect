

angular.module('angularSelect').directive('moSelect', ['$parse', '$timeout', function($parse, $timeout) {

    return {
        restrict: 'A',

        controller: ['$scope', '$attrs', '$interpolate', '$parse',  function($scope, $attrs, $interpolate, $parse) {
            this.selectAll = function(e) {
                var willSelected = !$scope[this.isSelectedAllName];
                var items = $scope[this.itemsName];
                if (this.beforeSelectAll(willSelected, items)) {
                    e.preventDefault();
                    return;
                }
                $scope[this.isSelectedAllName] = !$scope[this.isSelectedAllName];


                for (var i = 0; i < items.length; i++) {
                    items[i][this.itemSelectName] = $scope[this.isSelectedAllName];
                    this.syncSelectedList(items[i]);
                }


            };
            this.selectItem = function(e, item) {
                var willSelected = !item[this.itemSelectName];
                if (this.beforeSelect(willSelected)) {
                    e.preventDefault();
                    return;
                }

                item[this.itemSelectName] = willSelected;

                if (item[this.itemSelectName]) {
                    this.updateSelectAllState();

                } else {
                    $scope[this.isSelectedAllName] = false;
                }

                this.syncSelectedList(item);

            }
            this.updateSelectAllState = function() {
                var selectedAll = true;
                var items = $scope[this.itemsName];
                for (var i = 0; i < items.length; i++) {
                    if (!items[i][this.itemSelectName]) {
                        selectedAll = false;
                    }
                }
                //$scope[this.isSelectedAllName] = selectedAll;
            };
            this.setSelect = function(list) {
                if (!list) return;
                var that = this;
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];

                    var found = $scope[this.selectedListName].find(
                        function(selectedItem) {
                            return $scope[that.itemEqualFunc](item, selectedItem);

                        });
                    if (found) {
                        item.select = true;
                    }
                }
                this.updateSelectAllState();
            };
            this.beforeSelectAll = function(willSelected, items) {
                if (!willSelected) return;
                if (this.allowMultipleSelect) {
                    if (angular.isUndefined(this.selectCountLimit)) { return; }
                    if (!items || items.length <= 0) return;
                    if (($scope[this.selectedListName].length + items.length) > this.selectCountLimit) {
                        $toaster.warning("最多允许选择" + this.selectCountLimit);
                        return true; //返回true，表示阻止继续选择
                    }

                } else {
                    //单选情况,直接不允许全选。一般情况，单选的时候是不会有全选按钮的。
                    $toaster.warning("只允许单选!");
                    return true;

                }
            };
            this.beforeSelect = function(willSelected) {
                if (!willSelected) return;
                if (this.allowMultipleSelect) {
                    if (angular.isUndefined(this.selectCountLimit)) { return; }
                    if ($scope[this.selectedListName].length >= this.selectCountLimit) {
                        $toaster.warning("最多允许选择" + this.selectCountLimit);
                        return true; //返回true，表示阻止继续选择
                    }

                } else {
                    //单选的情况下，清除掉之前选择的
                    this.clearSelected();

                }

            };
            this.syncSelectedList = function(item) {
                var that = this;
                var found = $scope[this.selectedListName].find(
                    function(selectedItem) {
                        return $scope[that.itemEqualFunc](item, selectedItem);

                    });
                if (found) {
                    if (!item[this.itemSelectName]) {
                        $scope[this.selectedListName].remove(found);
                    }
                } else {
                    if (item[this.itemSelectName]) {
                        $scope[this.selectedListName].push(item);
                    }
                }
            };


            this.clearSelected = function() {
                $scope[this.selectedListName] = [];
                var items = $scope[this.itemsName];
                for (var i = 0; i < items.length; i++) {
                    items[i][this.itemSelectName] = false;
                }

            };
        }],
        link: function($scope, $element, $attrs, moSelectCtrl) {
            if (!$attrs.moSelect) throw new Error('no model provided'); //找出数据列表变量名
            moSelectCtrl.itemsName = $attrs.moSelect;
            if (!$attrs.itemName) throw new Error('no model provided'); //找出单条记录变量名
            moSelectCtrl.itemName = $attrs.itemName;


            moSelectCtrl.isSelectedAllName = $attrs.selectAllName ? $attrs.selectAllName : "isSelectedAll"; //配置全选标记变量名
            moSelectCtrl.selectedListName = $attrs.selectListName ? $attrs.selectListName : "selectList"; //配置选中列表变量名
            moSelectCtrl.itemSelectName = $attrs.itemSelectName ? $attrs.itemSelectName : "select"; //配置单个对象保存是否选中的标记变量名
            moSelectCtrl.selectedListName = $attrs.selectedListName ? $attrs.selectedListName : "selectedList"; //配置已选对象集合的变量名
            moSelectCtrl.itemEqualFunc = $attrs.itemEqualFunc ? $attrs.itemEqualFunc : "itemEqual"; //配置单个对象之间判定相等的方法,传递单个对象
            if (!$scope[moSelectCtrl.itemEqualFunc] || typeof $scope[moSelectCtrl.itemEqualFunc] != "function") {
                $scope[moSelectCtrl.itemEqualFunc] = function(item1, item2) {
                    return item1.id == item2.id;
                }
            }
            moSelectCtrl.allowMultipleSelect = $scope.$eval($attrs.allowMultipleSelect); //是否允许多选
            moSelectCtrl.selectCountLimit = $scope.$eval($attrs.selectCountLimit); //如果允许多选，最多可以选择多少个。不传，则不限制。


            $scope[moSelectCtrl.selectedListName] = $scope[moSelectCtrl.selectedListName] || [];

            var listWatcher = $scope.$watchCollection(moSelectCtrl.itemsName, function(newList) {
                // if (!$attrs.allowSpread) {
                //     $scope[moSelectCtrl.selectedListName] = [];
                // }
                moSelectCtrl.setSelect(newList);

            });
            var initSelectedListWatcher = $scope.$watchCollection($attrs.initSelectedList, function(newList) {
                $scope[moSelectCtrl.selectedListName] = angular.copy(newList || []);
                moSelectCtrl.setSelect($scope[moSelectCtrl.itemsName]);

            });
            var allowMultipleSelectWatcher = $scope.$watch($attrs.allowMultipleSelect, function(newV) {
                moSelectCtrl.allowMultipleSelect = newV;

            });
            var selectCountLimitWatcher = $scope.$watch($attrs.selectCountLimit, function(newV) {
                moSelectCtrl.selectCountLimit = newV;

            });
            $scope.$on('$destroy', function() {
                if (listWatcher) {
                    listWatcher();
                    listWatcher = null;
                }
                if (allowMultipleSelectWatcher) {
                    allowMultipleSelectWatcher();
                    allowMultipleSelectWatcher = null;
                }
                if (selectCountLimitWatcher) {
                    selectCountLimitWatcher();
                    selectCountLimitWatcher = null;
                }
            });
        }
    };
}]).directive('moSelectAll', ['$parse', '$timeout', function($parse, $timeout) {
    return {
        restrict: 'A',
        require: '^moSelect',
        controller: ['$scope', function($scope) {


        }],

        link: function($scope, $element, $attrs, moSelectCtrl) {

            $element.click(function(e) {
                //e.preventDefault();
                $timeout(function() {
                    moSelectCtrl.selectAll(e);
                });

            });
        }
    };
}]).directive('moSelectSingle', ['$parse','$timeout', function($parse,$timeout) {
    return {
        restrict: 'A',
        require: '^moSelect',
        controller: ['$scope', function($scope) {

        }],

        link: function($scope, $element, $attrs, moSelectCtrl) {


            $element.click(function(e) {
                // e.preventDefault();
                $timeout(function() {
                    moSelectCtrl.selectItem(e, $scope[moSelectCtrl.itemName]);
                });

            });
        }
    };
}]);