var temp_arr = [];
var memb_arr = [];
var user_arr = []; //입력값
var filtered_arr = []; //결과값
var result_arr = []; //중복제거값

// table to JSON
function tableToJson(table) { // 변환 함수
    var data = [];

    var headers = [];
    for (var i = 0; i < table.rows[0].cells.length; i++) {
        headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi, '');
    }

    for (var i = 1; i < table.rows.length; i++) {
        var tableRow = table.rows[i];
        var rowData = {};

        for (var j = 0; j < tableRow.cells.length; j++) {
            rowData[headers[j]] = tableRow.cells[j].innerHTML;
        }
        data.push(rowData);
    }

    return data;
}
var memb_arr = tableToJson(document.getElementById("memb_list")); // table id를 던지고 함수를 실행한다.


// fileRead
function fileRead() {
    // FileList
    var fileList = $('#read_contacts').files || event.target.files;
    // File
    var file = fileList[0];

    var file_name = file["name"];
    var file_chk = file_name.split('.')[1]
    if (file_chk == "vcf") {
        //파일명 출력
        $(this).next().next().text(file_name);
        $("#file_name").text(file_name);

        // fileRead
        var reader = new FileReader();
        reader.onload = function (progressEvent) {
            var result = progressEvent.target.result;
            // vcfToJSON함수로 file-data 전달
            vcfToJSON(result)
        };
        reader.readAsText(file);
    } else if (file_chk == "csv") {
        //파일명 출력
        $(this).next().next().text(file_name);
        $("#file_name").text(file_name);

        // fileRead
        var reader = new FileReader();
        reader.onload = function (progressEvent) {
            var result = progressEvent.target.result;
            // vcfToJSON함수로 file-data 전달
            csvToJSON(result);
        };
        reader.readAsText(file);
        // 확장자를 검색하여 잘못된 파일일 경우 경고창을 띄운 후 file-lode 취소
    } else {
        alert("잘못된 파일형식(" + file_chk + ")입니다. csv나 vcf파일을 올려주세요");
        $("#read_contacts").val("");
        $(this).next().next().text("");
        return false;
    };
}

// vcf - JSON으로 변환
function vcfToJSON(file_string) {
    // 배열 클리어
    user_arr = [];
    filtered_arr = [];
    result_arr = [];

    // 문자열을 줄바꿈으로 구분 후 배열에 저장 
    const rows = file_string.split("\r\n");

    // 제목 행 추출 후 콤마로 구분, 배열에 저장 
    const header = rows[0].split(",");

    // 내용 행 전체를 객체로 만들어 user_arr에 담기 
    for (i = 1; i < rows.length; i++) {
        // 빈 객체 생성
        var obj = {};
        // 각 내용 행을 콤마로 구분 
        var row = rows[i].split(",");
        // 각 내용행을 {제목1:내용1, 제목2:내용2, ...} 형태의 객체로 생성 
        for (j = 0; j < header.length; j++) {
            obj[header[j]] = row[j];
        }
        // 각 내용 행의 객체를 user_arr배열에 담기 
        user_arr.push(obj);
    };
    // 중복 검사 함수 실행
    find_gwonLi();
};

// csv - JSON으로 변환
function csvToJSON(file_string) {
    // 배열 클리어
    user_arr = [];
    filtered_arr = [];
    result_arr = [];

    // 문자열을 줄바꿈으로 구분 후 배열에 저장 
    const rows = file_string.split("\r\n");
    // 제목 행 추출 후 콤마로 구분, 배열에 저장 
    const header = rows[0].split(",");

    // 내용 행 전체를 객체로 만들어 user_arr에 담기 
    for (i = 1; i < rows.length; i++) {
        // 빈 객체 생성
        var obj = {};
        // 각 내용 행을 콤마로 구분 
        var row = rows[i].split(",");
        // 각 내용행을 {제목1:내용1, 제목2:내용2, ...} 형태의 객체로 생성 
        for (j = 0; j < header.length; j++) {
            obj[header[j]] = row[j];
        }
        // 각 내용 행의 객체를 user_arr배열에 담기 
        user_arr.push(obj);
    };
    // 중복 검사 함수 실행
    find_gwonLi();
};

// 중복번호 검색
function find_gwonLi() {
    for (i = 0; i < user_arr.length; i++) {
        // user_arr의 value
        var user_arr_val = Object.values(user_arr[i])

        for (j = 0; j < user_arr_val.length; j++) {
            if (user_arr_val[j] && user_arr_val[j] !== "\"\"") {
                // 휴대폰 번호만 추출하기 위해 모든 value의 숫자를 제외한 나머지 문자열들 제거
                var HP = user_arr_val[j].replace(/[^0-9]/g, "");
                // 10으로 시작하는 연락처 filtering
                var chk_10 = HP.slice(0, 2);
                // 010으로 시작하는 연락처 filtering
                var chk_010 = HP.slice(0, 3);
                // 휴대폰 번호만 filtering
                if (chk_010 == "010" || chk_10 == "10" && HP.length <= 11) {
                    if (HP.length = 11) { // 번호 길이가 11자리일 경우(010으로 시작) 010을 제외한 나머지 번호만을 추출
                        var new_HP = HP.slice(-8);
                    } else if (HP.length = 10) { // 번호 길이가 10자리일 경우(10으로 시작) 10을 제외한 나머지 번호만을 추출
                        var new_HP = HP.slice(-7);
                    };

                    // 기존 회원 데이터와 user주소록의 데이터 비교
                    for (k = 0; k < memb_arr.length; k++) {
                        // 기존 회원의 전화번호를 '-'없는 숫자형식으로 치환
                        var memb_num = memb_arr[k]["전화번호"];
                        var new_memb_num = memb_num.replace(/\-/gi, "");
                        // 회원 이름
                        var memb_name = memb_arr[k]["성명"];
                        // 010으로 시작하거나 10으로 시작하는 번호의 식별번호를 제외한 나머지 번호만 추출
                        if (memb_num.length = 11) {
                            new_memb_num = new_memb_num.slice(-8);
                        } else if (memb_num.length = 10) {
                            new_memb_num = new_memb_num.slice(-7);
                        };
                        // 기존 회원 번호와 user주소록의 번호가 같을 경우 filtered_arr에 push
                        if (new_memb_num == new_HP) {
                            filtered_arr.push({ "이름": memb_name, "번호": memb_num });
                        };
                    }
                }

            }
        }
    }
    dup_remove();
};

// 번호중복 제거
function dup_remove() {
    var tempArray = [];
    for (var i = 0; i < filtered_arr.length; i++) {
        var item = filtered_arr[i]
        if (tempArray.indexOf(item["번호"]) != -1) {
            continue;
        } else {
            result_arr.push(item);
            tempArray.push(item["번호"]);
        }
    }
    draw_table();
};

// 테이블 출력
function draw_table() {
    // filterd-data를 화면상에 table로 출력
    $("#gwon-li").empty();
    if (result_arr.length == 0) { // 데이터가 없을 경우
        var innerTbody = '<tr><td colspan="2">데이터가 없습니다.</td></tr>';
        $("#gwon-li").append(innerTbody);
    } else { // 데이터가 있을 경우
        for (var i = 0; i < result_arr.length; i++) {
            var innerTbody = '<tr><td>' + result_arr[i]["이름"] + '</td><td><a href="tel:"+result_arr[i]["번호"]+"">' + result_arr[i]["번호"] + '</a></td></tr>';
            $("#gwon-li").append(innerTbody);
        };
    }
    // 가려진 데이터 테이블 보여주기
    $("#show_gwon_li").show();
};

// vcf-read Logic
$('#read_contacts').on('change', function (event) {
    // 데이터 테이블을 비우고
    $("#gwon-li").empty();
    // 데이터 테이블 숨김처리
    $("#show_gwon_li").hide();
    fileRead();
});