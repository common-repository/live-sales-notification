// Executing function on browser loads
window.onload = function() {
	var adminPage;
	var forMobile;
	var loginPage;
	var frequent = 0;
	isPaused = false;
	hideFrontEnd = false;
	notificationBgColor = (lsnConfigurations.notification_bg_color !== '') ? lsnConfigurations.notification_bg_color : '#ffffff';
	frontEndSupport = lsnConfigurations.front_end_support;
	pluginUrl = lsnConfigurations.plugin_url;
	currentUrl = window.location+'';
	loginPage = checkLoginPage();
	if (checkAdmin(currentUrl)) {
		if (getParameterByName('page') === 'salespopup'){
			csvOptionVisibility();
		}
	}
	if (frontEndSupport === '0' && frontEndSupport !== '') {
        if(!checkAdmin(currentUrl)) {
            hideFrontEnd = true;
        } else {
            hideFrontEnd = false;
        }
    }	
	if (lsnConfigurations.admin_support === '0') {
		adminPage = checkAdmin(currentUrl);
	}
	if (lsnConfigurations.mobile_support === '0') {
		forMobile = checkMobile();
	}
	if (adminPage === true || forMobile === true || hideFrontEnd === true || loginPage === true) {
		return false;
	} else {
		cnt = 1;
		var interval2;
		var jsonData; 
		startTime = (lsnConfigurations.start_time !== "") ? lsnConfigurations.start_time : 3;
		showingTime = (lsnConfigurations.showing_time !== "" && lsnConfigurations.showing_time > 1) ? lsnConfigurations.showing_time : 5;
		gapTime = (lsnConfigurations.gap_time !== "" && lsnConfigurations.gap_time > 0) ? lsnConfigurations.gap_time : 2;
		default_frequent_count = (lsnConfigurations.frequent_count !== "") ? lsnConfigurations.frequent_count : 5;		
		if(lsnConfigurations.csv_data === '0' && lsnConfigurations.csv_data !== '') {
			jsonData = JSON.parse(lsnConfigurations.live_json_data);
		} else {
			javaScriptAjaxFileLoad();				
		}
		setTimeout(function(){
			showNotification()
		},startTime*1000);
		var notification_element = document.createElement('div');
		notification_element.setAttribute("id", "notif");
		notification_element.setAttribute("onmouseenter", "stayPopup('yes')");
		notification_element.setAttribute("onmouseleave", "stayPopup('no')");
		notification_element.style.cssText = 'width:336px; height:108px; z-index:100000; background-color:'+notificationBgColor+'; position:fixed; color: grey; display:none; overflow:hidden; bottom:20px; left:20px;  font-size:15px; font-family:Helvetica Neue,Helvetica,Arial,sans-serif;';
		document.body.appendChild(notification_element);
		notif = document.getElementById('notif');
		minHeight = 0;
		maxHeight = 100;
		time = 500;
		timer = null;
		toggled = true;
		slider = document.getElementById('notif');
		slider.style.height = minHeight + 'px';

		// Calling demo data using javascript XMLHttpRequest
		function javaScriptAjaxFileLoad() {
			var url = pluginUrl+"demo-csv/uploaded_demo_data.csv";		
			var request = new XMLHttpRequest();  
			request.open("GET", url, false);   
			request.send(null);  
			var data = request.responseText;
			if (data === '') {
				url = pluginUrl+"demo-csv/demo.csv";		
				request = new XMLHttpRequest();  
				request.open("GET", url, false);   
				request.send(null);
				data = request.responseText; 
			}
			csvStringData = CSV2JSON(data);
		    jsonData = JSON.parse(csvStringData);
		}

		// Convert CSV format into Array format
		function CSVToArray(strData, strDelimiter) {
		    strDelimiter = (strDelimiter || ",");
		    var objPattern = new RegExp((
		    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
		    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
		    "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
		    var arrData = [[]];
		    // var arrMatches = null;
		    var arrMatches;
		    while (arrMatches = objPattern.exec(strData)) {
		        var strMatchedDelimiter = arrMatches[1];
		        var strMatchedValue;
		        if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
		            arrData.push([]);
		        }
		        if (arrMatches[2]) {
		            strMatchedValue = arrMatches[2].replace(
		            new RegExp("\"\"", "g"), "\"");
		        } else {
		            strMatchedValue = arrMatches[3];
		        }
		        arrData[arrData.length - 1].push(strMatchedValue);
		    }
		    return (arrData);
		}

		// Convert CSV format into JSON format
		function CSV2JSON(csv) {			
		    var array = CSVToArray(csv);
		    var objArray = [];
		    for (var i = 1; i < array.length; i++) {
		        objArray[i - 1] = {};
		        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
		            var key = array[0][k];
		            objArray[i - 1][key] = array[i][k]
		        }
		    }
		    var json = JSON.stringify(objArray);
		    var str = json.replace(/},/g, "},\r\n");
		    return str;
		}

		// Hide current showing notification
		function hideNotification() {			
			interval2 = setInterval(function()
			{
				if (!isPaused) {
					cnt++;
				}	
				if(cnt === parseInt(showingTime))
				{	
					toggled = true;
					slideToggle();
					clearInterval(interval2)
					setTimeout(function(){		
						showNotification()
					},gapTime*1000)
					cnt = 1;
				}
			},1000)					
		}

		// Show new notification
		function showNotification() {
			if(frequent === parseInt(default_frequent_count)) {
				toggled = true;
				slideToggle();
				return false;
			}
			var productnametrimmed;
			var username;
			var randomid = Math.floor(Math.random() * jsonData.length);
			var productname = (jsonData[randomid].product_name) ? jsonData[randomid].product_name : "Unknown product";
			if (lsnConfigurations.change_user_name === '0') {
				username = "Someone";
			} else {
				username = (jsonData[randomid].user_name) ? jsonData[randomid].user_name : "Unknown user";
			}
		    if(productname.length > 25) {           
		        str = productname.substring(0,20);            
		        productnametrimmed = str + '<span>...</span>';          
		    } 
		    else{
		        productnametrimmed = productname;
		    } 	
		    if (!jsonData[randomid].product_image)  {
		    	jsonData[randomid].product_image = pluginUrl+'images/no_image.png';
		    }
		    if (!jsonData[randomid].state)  {
		    	jsonData[randomid].state = 'Unknown state';
		    }
		    if (!jsonData[randomid].country)  {
		    	jsonData[randomid].country = 'Unknown country';
		    }
		    if (!jsonData[randomid].product_url)  {
		    	jsonData[randomid].product_url = 'https://goo.gl/images/CEKdMM';
		    }
		    if (!jsonData[randomid].order_created) {
		    	jsonData[randomid].order_created = 'Unknown mins';
		    }
		     
			notif.innerHTML = '<img style="height: 85px; float: left; width: 85px; margin:7px 10px 2px 2px;" src='+jsonData[randomid].product_image+'><p style="margin: 4px 0px 8px 6px; width: 230px; float: left; font-size: 12px;"><span style="max-height: 14px; text-overflow: ellipsis; display: inline-block; width: 207px; overflow: hidden; white-space: nowrap;">'+username+' in '+jsonData[randomid].state+', '+jsonData[randomid].country+'</span><span id="closepopup" onmouseenter="changeMousePointer()" onclick="closePopup()" style="float:right; display:inline-block; border-radius: 24px; font-size: 20px;"><img src="'+pluginUrl+'images/closeimg.png" style="width:16px; height:15px; padding-right: 5px;"></span><br>purchased a </p><br><a style="font-weight: bold; margin-left: 5px; color: #000000a1; font-size: 18px; text-decoration: none;" target="blank" href="'+jsonData[randomid].product_url+'">'+productnametrimmed+'</a> <p style="    margin: 8px 0px 4px 6px; width: 230px; float: left; font-size:10px;">'+jsonData[randomid].order_created+' ago</p>';			
			toggled = false;
			notif.style.display = "block";
			slideToggle();
			frequent++;

			setTimeout(function() {
				hideNotification()
			},startTime*1000);
		}
	}
};

// Check admin with url slug
function checkAdmin(the_url) {
	var the_arr = the_url.split('/');
	return ( the_arr.includes('wp-admin') );
}

// Check login page or not to hide notifications for admin login page
function checkLoginPage() {
	if(window.location.href.indexOf("wp-login") > -1) {
        return true;
    }
}

// Check device is mobile or not
function checkMobile() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
 	return check;
};

// Change cursor style while hovering close icon in the notification
function changeMousePointer() {
	document.getElementById('closepopup').style.cursor = 'pointer';
}

// Freeze notification on mouse hover
function stayPopup(pause) {
	if(lsnConfigurations.freeze_notification === '1') {
		if (pause === 'yes') {
			isPaused = true;	
		} else {
			isPaused = false;		
		}
	} else {
		isPaused = false;
	}
}

// Close current notification while clicking close button
function closePopup() {
	toggled = true;
	slideToggle();	
}

// Slideup/slidedown function in javascript
function slideToggle() {  
    clearInterval(timer);
    var instanceHeight = parseInt(slider.style.height); 
    var init = (new Date()).getTime();
    var height = (toggled = !toggled) ? maxHeight: minHeight; 
    var disp = height - parseInt(slider.style.height);
    timer = setInterval(function() {
        var instance = (new Date()).getTime() - init;
        if (instance <= time ) { 
            var pos = instanceHeight + Math.floor(disp * instance / time);
            slider.style.height =  pos + 'px';
        } else {
            slider.style.height = height + 'px';
            clearInterval(timer);
        }
    },1);
}

// Get query string value by passing url and query string parameter
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Hide and show demo csv upload field based on admin selection 
function csvOptionVisibility() {
    var csvData = document.getElementsByName("salespopup_csv_data");
    var downloadCsv = document.getElementById("demo_file");           
    var uploadCsv = document.getElementById("upload_demo_file");
	var upload_status = document.getElementById('salespopup_upload_status');
    for (var i = 0; i < csvData.length; i++) {
        if (csvData[i].checked) {
        	var csvDataFrom = csvData[i].value;
        }
    }
    if (csvDataFrom === '1') {
        downloadCsv.style.display = "table-row";
    	uploadCsv.style.display = "block";
    } else {
        uploadCsv.value = "";
        uploadCsv.style.display = "none";
        downloadCsv.style.display = "none";
        upload_status.value = '0';
    }
}

// Update demo csv file uploaded status true/false
function updateUploadStatus() {
	var file_choose = document.getElementById('upload_demo_file');
	var upload_status = document.getElementById('salespopup_upload_status');
	if(file_choose.value !== ''){
		upload_status.value = '1';
	} else {
		upload_status.value = '0';
	}
}

// Download demo csv using javascript
function downloadFile() {
    var url = pluginUrl+'demo-csv/demo.csv';
    var link = document.createElement("a");
    link.download = 'demo.csv';
    link.href = url;
    link.click(); 
}
