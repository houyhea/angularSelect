# angularSelect
## 开头

 开发业务后台经常要用到表格里的选择，全选这种交互。而且不同系统不同场景的UI还不一样。比如：表格里就是简简单单的checkbox；图片列表这种，UI设计师会搞点花样，用户选择一下，会在图片上盖一层半透明的勾选提示等等。我们的系统是用angular 1.X版本开发。所以，我采用angular的装饰性指令编写几个指令，把它们配合在一起使用，来封装这样的场景。这与之前我们遇到的组件的开发思路又不太一样。我们先来分析一下需求及扩展点。
## 需求分析
1. 实现单选；
1. 实现全选；
2. 可以设置允许多选还是单选。如果多选，有最大选择数限制；
1. 实现跨页选择。这里的跨页选择指的是切换到下一页后，还能记住上一页的选择。以前我们遇到的选择往往都是只记住当前页，一旦刷新就清空了。这是一个不同的地方；
2. 要求自己定义UI及交互触发；
## 设计思路
1. 这里其实是相同的地方就是选择的交互逻辑，所以重点考虑如何封装这个逻辑。这里的交互逻辑主要是：
    2. 点击全选；
    3. 点击列表item的选择切换。如果是单选，要清空之前的选择；如果是多选，要检查是否超过最大选择限制；
1. 再来看一下应用场景相同的地方。我们将设定上下文肯定有一个list数组，一个已选数组。
因此，我们得到如下的指令。
## moSelect指令
封装全选逻辑的指令。适应场景：
1. 有一个list集合；
1. 每一个item是一个对象；
1. 跨页选择；

### 使用方式


```
<table  mo-select="list"  select-all-name="isSelectedAll" item-name="item" item-select-name="select" selected-list-name="selectedList" init-selected-list="initSelectedList" allow-multiple-select="false" select-count-limit="2" item-equal-func="itemEqual">
                        <thead>
                            <tr>
                                <th><input type="checkbox" ng-checked="isSelectedAll" mo-select-all></th>
                                <th>商户名称</th>
                                <th>电话</th>
                                <th>地点</th>
                                <th>更新时间</th>
                                <th>播放</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr ng-repeat="item in list" mo-select-single >
                                <td>
                                     <input type="checkbox" ng-checked="item.select"  mo-select-single1 > 
                                </td>
                                <td>{{item.name}}</td>
                                <td>{{item.tel}}</td>
                                <td>{{item.addr}}</td>
                                <td>{{item.updateTime|msDateFormat:'YYYY-MM-DD'}}</td>
                                <td>
                                    <div audio-playable="item.url" play-trigger=".audio-play"  pause-trigger=".audio-pause">
                                        <button class="btn btn-primary audio-play" ng-show="!audioInfo.playing" >播放</button>
                                        <button class="btn btn-primary audio-pause" ng-show="audioInfo.playing" >暂停</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>

                    </table>
```
说明：
1. 主要通过三个指令实现全选相关的代码封装；
1. mo-select 是容器指令，定义了全选，以及单选item的方法，定义在列表容器dom上；
    1. mo-select的值是scope的list对象，与ng-repeat里的items一致；
    1. item-name：告诉指令，每一项的对象名，指令会通过该名称在每一项的scope里查找。与ng-repeat里的item一致；
    1. select-all-name:全选的状态变量。默认：isSelectedAll
    1. item-select-name: 记录的每一项对象是否选中的变量名，将会存储在item对象上，为了避免与现有业务字段重合，可以配置，也可以不配置，默认：select；
    1. selected-list-name:已选对象列表的变量名。默认：selectedList；
    1. init-selected-list：初始化选择对象列表。该变量只用于初始化，类似vue 组件里的prop属性；
    1. allow-multiple-select:是否允许多选；
    1. select-count-limit1：如果允许多选，最多可以选择多少个。如果不传，则无限；
    1. item-equal-func：对象判等函数，用于封装业务对象自己的判等原则。比如：有些场景是根据id，有些是根据其他业务逻辑。如果不传，默认根据对象的id属性；
1. mo-select-all 全选指令。定义在全选dom上，一版是一个input checkbox。其值表示在当前scope保存的是否全选的变量名；
1. mo-select-single 单选指令。 定义在每一项dom上。可以有两个地方：
    1. 定义在自己的input chebox上
    1. 定义在input的容器上。类似tr，实现点击整行选中。也可以定义在某个单个元素上。

如果要获取已选项，直接在当前scope获取selected-list-name指定的变量名即可。

### 使用步骤：
1. 在容器定义mo-select，根据实际需求，配置相关参数。必须：mo-select，item-name;
1. 在需要全选的按钮dom上添加mo-select-all指令，不需要配置任何参数；
1. 在ng-repeat的单项模板里，在需要添加单选交互的dom上添加mo-select-single指令，不需要配置任何参数；
1. 完成配置。
### 注意事项
1. mo-select的值一定要和ng-repeat的items一致；
1. item-name的值一定要和ng-repeat的item一致；

## 总结
这样的指令在我们的业务开发中使用还是很灵活的。可能看起来配置项有点麻烦，其实大多数都是可以采用默认值的。我们看看它的不同表现形式：
![demo2](https://raw.githubusercontent.com/houyhea/angularSelect/master/demo2.png)
![demo](https://raw.githubusercontent.com/houyhea/angularSelect/master/demo1.png)

代码不多，200来行，代码是从项目里摘出来的，不是很复杂，就没做demo，这里分享出来，[代码链接。](https://github.com/houyhea/angularSelect)有兴趣要改进的同学可以拿去随便改。


