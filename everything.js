var WykopAPIKey = "uwxrtN984S";
var WykopSecretKey = "yf4pWJibuG";
var request = new XMLHttpRequest();
var type = "profile";
var method = "entries";
var parameters = "wooles";
var page = 1;
var out = "";
var totalAttention = 0;
var totalEntries = 0;
var entries = [[],[]];
var daysAmount = 7;
var namesarray = [];
function parse() {
    if (page==1) {
        out = "";
        entries = [[],[]];
        totalAttention = totalEntries = 0;
        daysAmount = document.getElementById("days").value;
        if (daysAmount > 31) {
            daysAmount = 31;
            document.getElementById("days").value = 31;
        }
        namesarray = [];
    }
    var UrlRequest = "http://a.wykop.pl/" + type + "/" + method + "/" + document.getElementById("nick").value + "/appkey," + WykopAPIKey + ",page," + page;
    request.onreadystatechange = function() {
        if (request.readyState==4 && request.status==200) {
            var myArr = JSON.parse(request.responseText);
            console.log(request.responseText);
            output(myArr);
        }
    }
    var requestSignature = md5(WykopSecretKey + UrlRequest);
    console.log(requestSignature); 
    request.open("GET", UrlRequest, true);
    request.setRequestHeader("apisign", requestSignature);
    request.send();     
}
function output(unparsedtext) {
    var i;
    var minusXDaysDate = new Date();
    minusXDaysDate.setDate(minusXDaysDate.getDate()-daysAmount);
    for (i=0; i<unparsedtext.length; i++) {
        var randomanimeshitID = (unparsedtext[i].body).search("#randomanimeshit");
        if (randomanimeshitID>-1) {
            var dt  = (unparsedtext[i].date).split(/\-|\s/)
            dat = new Date(dt.slice(0,3).join('/')+' '+dt[3]);
            if (dat >= minusXDaysDate) {
                var re = /(?:^|\W)#(\w+)(?!\w)/g, match, matches = [];
                while (match = re.exec(unparsedtext[i].body)) {
                    matches.push(match[1]);
                }
                totalAttention+=unparsedtext[i].vote_count;
                var temppush = new Array();
                temppush[0] = dat;
                temppush[1] = unparsedtext[i].vote_count; 
                temppush[2] = unparsedtext[i].embed.url;
                temppush[3] = unparsedtext[i].voters;
                temppush[4] = matches;
                entries.push(temppush);
                totalEntries++; 
            }
        }
    }
    if (dat >= minusXDaysDate) {
        page++;
        parse();
    } else {
        page = 1;
        entries.sort(compareSecondColumn);
        for (i=0; i<totalEntries; i++) {
            for (j=0; j<entries[i][3].length; j++) {
                namesarray.push(entries[i][3][j].author);
            }
            out += ("0"+ entries[i][0].getDate()).slice(-2) + "." + ("0"+(entries[i][0].getMonth()+1)).slice(-2) + "." + entries[i][0].getFullYear() + " " + ("0"+entries[i][0].getHours()).slice(-2) + ":" + ("0"+entries[i][0].getMinutes()).slice(-2) + ":" + ("0"+entries[i][0].getSeconds()).slice(-2) + " <b>" + entries[i][1] + "</b> <a href='" + entries[i][2] + "'>Link</a> ";
            for (j=0; j<entries[i][4].length; j++) {
                out += "#" + entries[i][4][j] + ", ";
            }
            out += "<br><br>";
        }
        
        out += "Łącznie przez ten okres otrzymał <b>" + totalAttention + "</b> plusów, przy <b>" + totalEntries + "</b> wpisach, średnio <b>" + Math.round(totalAttention/totalEntries*100)/100 + "</b> na wpis.<br><br>";
        var resultsArray = compressArray(namesarray);
        resultsArray.sort(compareNicks);
        console.log(resultsArray);
        out += "Otrzymał plusy od <b>" + resultsArray.length + "</b> osób przez ten czas.<br><br>";
        out += "Najwięcej plusów podarowali:<br>"
        for (i=0; i<resultsArray.length; i++) {
            out += resultsArray[i].amount + " (<b>" + resultsArray[i].pluses + "</b>)<br>";
            if (i>24) {
                break;
            }
        }
    }
    document.getElementById("hai").innerHTML = out;   
}

function compareSecondColumn(a,b) {
    if (a[1] === b[1]) {
        return 0;
    } else {
        return (a[1] > b[1]) ? -1 : 1;
    }
}

function compareNicks(a,b) {
    if (a.pluses < b.pluses)
        return 1;
    else if (a.pluses > b.pluses)
        return -1;
    else 
        return 0;
}

// Kudos to ralphcrisostomo for this solution
function compressArray(original) {
 
	var compressed = [];
	var copy = original.slice(0);
	for (var i = 0; i < original.length; i++) {
 
		var myCount = 0;	
		for (var w = 0; w < copy.length; w++) {
			if (original[i] == copy[w]) {
				myCount++;
				delete copy[w];
			}
		}
 
		if (myCount > 0) {
			var a = new Object();
			a.amount = original[i];
			a.pluses = myCount;
			compressed.push(a);
		}
	}
 
	return compressed;
};