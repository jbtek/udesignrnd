(function(angular){
var browserWidth = 0;
var currMode = "";
var isMobile = false; //initiate as false
var iPagerIndex = 0;
var pagerMainLen = 2;
var udData = {};
var currSlectedCmpt = 0;
var currPageCnt;
var isResizing = false;

// device detection
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 isMobile = true;
} 

//Angular to designed view..	
var app = angular.module("udesignModule",[]);
	app.factory("udesignFactory", function($http){
		var objFact = {};
		objFact.callback = function(tempCallBack){
			$http.get("assets/data/udesigndata.txt").success(function(result){
				tempCallBack(result);
			})
		}
		
		return objFact;
	})
	.controller("UDesignController",function($scope,udesignFactory,$timeout){
		$scope.filledData = {};
		$scope.element = {};
		$scope.pagerElement = {};
		$scope.childScope = {};
		$scope.bPreloader = true;
		$scope.bShowReview = false;
		$scope.allData = [];
		
		udesignFactory.callback(onDataLoaded)
		function onDataLoaded(jsonData)
		{
			$scope.uDesignData = jsonData.data;
			$scope.componentData = jsonData.data.component;
			
			//this will change the scope data on rutime when review button is clicked.
			$scope.updateData = function() {
				$scope.allData = [];
				$scope.showHideCmptType();
				$scope.getAllFormData();
				//console.log("$scope.allData::"+$scope.allData);
			 	$scope.filledData.items = $scope.allData;
	   			//console.log("$scope.items::"+$scope.filledData.items[1]);
			};
			
			//init app here//
			$scope.init = function(elem){
				$scope.element = elem;
				$timeout(function(){
					$scope.bPreloader = false;
					checkOrientation();
					$scope.showHideCmpt();
				},300);
			}
			
			$scope.swipeLeft = function(){
				alert("SWAPING LEFT");
			}
			
			$scope.swipeRight = function(){
				alert("SWAPING RIGHT");
			}
			
			$scope.showHideCmpt = function(){
				$scope.bShowReview = false;
				var childs = $scope.element.parent().parent().children();
				var innerChilds = childs.find("component-type");
				innerChilds.css("display","none")
				$scope.cmptElem = innerChilds.eq(currSlectedCmpt).css("display","block");
				$scope.activatePager();
				$scope.$broadcast("navClicked"); 		
			}
			
			$scope.showHideCmptType = function(){
				var childs = $scope.element.parent().parent().children();
				var innerChilds = childs.find("component-type");
				innerChilds.css("display","none")
				
				var childs = $scope.pagerElement.children();
				childs.css("display","none");
			}
						
			$scope.activeCmpt = function(ind,pagerLen){
				var data = {index:ind,len:pagerLen};
				$scope.$broadcast("pagerClicked",data);
			}
			
			$scope.activatePager = function(){
				var childs = $scope.pagerElement.children();
				childs.css("display","none");
				$scope.pagersChilds = childs.eq(currSlectedCmpt);
				$scope.pagersChilds.css("display","block")
				$scope.activePager(0);
			}
			
			$scope.activePager = function(ind){
				var childs = $scope.pagersChilds.children();
				childs.find("a").removeClass("active");
				childs.eq(ind).find("a").addClass("active");
			}
			
			$scope.getAllFormData = function(){
				var childs = $scope.element.parent().parent().children();
				var innerChilds = childs.find("component-type");
				console.log(innerChilds.eq(0).children());
				$scope.allData[0] = getFitData(innerChilds.eq(0));
				$scope.allData[1] = getStyleData(innerChilds.eq(1));
				$scope.allData[2] = getStyleData(innerChilds.eq(2));
			}
			
			function getFitData(element)
			{
				var arr = [];
				var custCmpt = element.find("custom-component")
				for(var i=0; i<custCmpt.length; i++){
					arr[i] = getFitSectionData(custCmpt.eq(i));
				}
				return arr;
			}
				
			function getFitSectionData(element)
			{
					var header = element.find("h3").text();
					var img = element.find("img").attr("src");
					var pValue = element.find("p").text();
					var opt = element.find("select");
					var size = opt.val();
					if(size==="Select Size")
					size = "";
					
					var obj = {"header":header,"img":img,"para":pValue,"size":size};
					return  obj;	
			}
				
			function getGallaryData(element)
			{
				var isChecked = getCheckedImgData(element);
				var imgSelected = "";
				var header = "";
				if(isChecked)
				{
					imgSelected = element.find("img").attr("src");
					header = element.find("h3").text();
				}
				var obj = {"srcImg":imgSelected,"headerg":header,"header":""};
				return obj;
			}
			
			function getCheckedImgData(element){
				var inputElem = element.find("input");
				var nInptLen = inputElem.length;
				var isChecked = false;
				for(var i = 0; i<nInptLen; i++)
				{
					if(inputElem.eq(i).prop("checked"))
					isChecked = inputElem.eq(i).prop("checked")
				}
				return isChecked;
			}
				
		  function getStyleData(element)
			{
				var arr = [];
				var custCmpt = element.find("custom-component")
				for(var i=0; i<custCmpt.length; i++){
					var strGallary = String(custCmpt.eq(i).find("article").attr("class").split(" ")[0]);
					var objFit = {};
					var gData = {};
					var objStyle = {};
					if(strGallary=="fit-section")
					{
						objFit = getFitSectionData(custCmpt.eq(i));
						arr[i] = objFit;
					}
					else
					{
						gData = getGallaryData(custCmpt.eq(i));
						arr[i] = gData;
					}
				}
				return arr;
			}
		}
	}).
	directive("customComponent",function($compile,$timeout){	
		var linker = function(scope,elem,attr)
		{
				if(scope.content.sizes)
				scope.sizes = scope.content.sizes.split(",");
				
				if(scope.content.images)
				scope.imgs = scope.content.images.split(",");
				
				if(scope.content.desc)
				scope.desc = scope.content.desc;
				
				scope.getTemplate = function(cType)
				{
					var templates = "";
					switch(cType)
					{
						case "custom-select":
						templates = 'templates/fit.html';
						break;
						case "gallary":
						templates = 'templates/gallary.html';
						break;
					}
					
					return templates;	
				}
				
				scope.temptl = scope.getTemplate(scope.content.type);
				//How to load dynamic html file
				var template = '<div ng-include="temptl"></div>';
				var linkFn = $compile(template);
				var content = linkFn(scope)
				elem.append(content);
				
				/////////////////////////////
				
		}
		
		return{
			restrict: 'E',
			link:linker,
			scope: {
				content: '='
			}
		}
	}).
	directive("componentType", function($compile){
		var linker = function(scope,elem,attr)
		{
			
				if(currSlectedCmpt===0)
				cmptStatus = [false,false,false,false,false,false];
				else if(currSlectedCmpt===1)
				cmptStatus = [false,false,false,false,false,false,false,false,false];
				else
				cmptStatus = [false,false];
				
					
				scope.getPagerStatusOnPagerClicked = function(data){
					var cmptStatus = []
					
					if(currSlectedCmpt===0)
					cmptStatus = [false,false,false,false,false,false];
					else if(currSlectedCmpt===1)
					cmptStatus = [false,false,false,false,false,false,false,false,false];
					else
					cmptStatus = [false,false];
					
					var ind = data["index"];
					var pagerLen = data.len;
					var len = cmptStatus.length/pagerLen;
					var i = Math.ceil(len*ind);
					var finalLen = Math.ceil((len)*(ind+1));
					console.log(finalLen+":::i::"+i)
					
					for(i; i<finalLen; i++)
					{
						cmptStatus[i] = true;	
								
					}
					
					return cmptStatus;
				}
				
				scope.updateCmptData = function(){
					scope.getWindowDimensions = function () {
						return {
							'w': window.innerWidth,
							'cmptStatus':cmptStatus
						};
					};
					scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
						scope.windowWidth = newValue.w;
						scope.cmptStatus = scope.showHideCmptOnResize(newValue.w);
					}, true);
				}
				
				scope.$parent.$on("pagerClicked",function(e,data){			
					scope.cmptStatus = scope.getPagerStatusOnPagerClicked(data);
				})
				
							
				scope.$parent.$on("navClicked",function(e){
					scope.updateCmptData();
				})
				
				window.onresize = function () {
					scope.$apply();
				};
				
				
				scope.showHideCmptOnResize = function(browserW){
				var cmptStatus = [];
					if(currMode==="PORTRAIT" || currMode==="LANDSCAPE")
					{
						if(browserW >= 768 && browserW <= 1024) 
						{
							if(currSlectedCmpt===0)
							cmptStatus = [true,true,true,false,false,false];
							else if(currSlectedCmpt===1)
							cmptStatus = [true,true,true,false,false,false,false,false,false];
							else
							cmptStatus = [true,true];
						}
						else if(browserW<768)
						{
							if(currSlectedCmpt===0)
							cmptStatus = [true,true,true,true,true,true]
							else if(currSlectedCmpt)
							cmptStatus = [true,true,true,true,true,true,true,true,true]
							else
							cmptStatus = [true,true]
						}
					}
					else
					{
						if(browserW>1024)
						{
							if(currSlectedCmpt===0)
							cmptStatus = [true,true,true,false,false,false];
							else if(currSlectedCmpt===1)
							cmptStatus = [true,true,true,false,false,false,false,false,false];
							else
							cmptStatus = [true,true];
							
						}
						else if(browserW<1024 && browserW>=768)
						{
							if(currSlectedCmpt===0)
							cmptStatus = [true,true,false,false,false,false];
							else if(currSlectedCmpt===1)
							cmptStatus = [true,true,false,false,false,false,false,false,false];
							else
							cmptStatus = [true,true];
						}
						else if(browserW<768)
						{
							if(currSlectedCmpt===0)
							cmptStatus = [true,false,false,false,false,false];
							else if(currSlectedCmpt===1)
							cmptStatus = [true,false,false,false,false,false,false,false,false];
							else
							cmptStatus = [true,false];
						}
					}
					
					return cmptStatus;
				}
			
			////////
				
				///////////
			var template = '<custom-component class="cmpt" ng-repeat="item in contentData.fields" ng-swipe-left="swipeLeft()" ng-swipe-right="swipeRight()" content="item" data-ng-show="cmptStatus[$index]"></custom-component>'
			elem.html(template);
            $compile(elem.contents())(scope);
			
			if(scope.$parent.$last)
			scope.$parent.$parent.init(elem);
				
		}
		
		return{
			restrict: 'E',
			link:linker,
			scope: {
				contentData: '='
			}
		}
	})
	.directive("reviewComponent", function($compile,$timeout){
		return{
			restrict: 'E',
			scope: {
				items: '='
			},
			templateUrl:"templates/review.html",
			controller:"myDirectiveCtrl",
			controllerAs:"ctrl"
		}
	})
	.controller('myDirectiveCtrl', function($scope) {
       this.items = $scope.items;
    })
	.directive("navComponent", function(){
		return{
			restrict: 'E',
			templateUrl:"templates/nav.html",
			link:function(scope,elem,attr){
				
				scope.navClickHandler = function(ind){
					currSlectedCmpt = ind;
					scope.activeIcon(ind);
					
					if(ind<3)
					scope.showHideCmpt();
					else
					{
						scope.bShowReview = true;
						scope.updateData();
					}
				}
				
				scope.activeIcon = function(ind){
					var childs = elem.children().children().children();
					childs.removeClass("active-icon");
					childs.eq(ind).addClass("active-icon");
				}
				
			}
		}
	})
	.directive("pagerComponent", function($window){
		return{
			restrict: 'E',
			templateUrl:"templates/pager.html",
			scope: {
				contentData: '='
			},
			link:function(scope,elem,attr)
			{	
				scope.arrPagerStatus = [true,true,true,true,true,true];
				
				scope.showPageOnPagerClicked = function(ind){
					scope.$parent.activePager(ind);
					scope.$parent.activeCmpt(ind,scope.pagerLen);
				}
				scope.activatePager = function()
				{
					scope.$parent.pagerElement = elem;
					scope.$parent.activatePager();
				}
				
				scope.updatePagerData = function(){
						scope.getWindowDimensions = function () {
						return {
							'w': window.innerWidth,
							'pagerStatus':scope.arrPagerStatus
						};
					};
					scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
						scope.windowWidth = newValue.w;
						scope.pagerStatus = scope.showHidePagerOnResize(newValue.w);
						scope.pagerLen = getLength(scope.pagerStatus);
					}, true);
				}
				
				scope.$parent.$on("navClicked",function(e){
					scope.updatePagerData();
				})
				
				window.onresize = function () {
					scope.$apply();
				};
				
				function getLength(arr){
					var count = 0;
					for(var i=0; i<arr.length; i++)
					{
						if(arr[i])
						count++;
					}
					
					return count;
				}
				
				scope.showHidePagerOnResize = function(browserW){
					var pagerStatus = [];
					if(currMode==="PORTRAIT" || currMode==="LANDSCAPE")
					{
						if(browserW >= 768 && browserW <= 1024) 
						{
							if(currSlectedCmpt===0)
							pagerStatus = [true,true,false,false,false,false];
							else if(currSlectedCmpt===1)
							pagerStatus = [true,true,false,false,false,false,false,false,false];
							else
							pagerStatus = [true,true];
						}
						else if(browserW<768)
						{
							if(currSlectedCmpt===0)
							pagerStatus = [true,true,true,true,true,true]
							else if(currSlectedCmpt)
							pagerStatus = [true,true,true,true,true,true,true,true,true]
							else
							pagerStatus = [false,false]
						}
					}
					else
					{
						if(browserW>=1024)
						{
							if(currSlectedCmpt===0)
							pagerStatus = [true,true,false,false,false,false];
							else if(currSlectedCmpt===1)
							pagerStatus = [true,true,true,false,false,false,false,false,false];
							else
							pagerStatus = [false,false];
							
						}
						else if(browserW<1024 && browserW>=768)
						{
							if(currSlectedCmpt===0)
							pagerStatus = [true,true,true,false,false,false];
							else if(currSlectedCmpt===1)
							pagerStatus = [true,true,true,true,true,false,false,false,false];
							else
							pagerStatus = [false,false];
						}
						else if(browserW<768)
						{
							if(currSlectedCmpt===0)
							pagerStatus = [true,true,true,true,true,true];
							else if(currSlectedCmpt===1)
							pagerStatus = [true,true,true,true,true,true,true,true,true];
							else
							pagerStatus = [true,true];

						}
					}
					
					return pagerStatus;
				}
			}
		}
	})
	
//Global and public functions
function checkOrientation()
{
		if(isMobile)
		{
			 var width = window.innerWidth;
			 var height = window.innerHeight;
			 			 
			 if(width>height)
			 currMode = "LANDSCAPE";
			 else
			 currMode = "PORTRAIT";		 
		}
}

}(window.angular));