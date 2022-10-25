/**
@ git수정
@ git수정
@ git수정
@ git수정
**/
const probability = num => (num >= (Math.random() * 100 | 0) + 1) ? true : false;
const more = "​".repeat(500);
const FS = FileStream;
const fishOn = {};  // 낚시유무[s]
const sortFish = {};  // 물고기정렬단계[s]
const sortRod = {};  // 낚싯대정렬단계[s]
const fishJoin = {};  // 가입단계[s]
const tradeOn = {};  // 교환단계[s]
const certifyOn = {};  // 인증단계[s]
const rebirthOn = {};  // 환생단계[s]
const me = {};  // 유저데이터[s]
const co = {};  // 유저도감[s]
const f = {};  // 낚시객체[s]
const Num = {};  // 채팅갯수[r]

/** Load Functions **/
const Func = require('Fishing2/function');
Name = Func.Name;
ObValue = Func.Object_value;
And = Func.And;
Div = Func.Div;
TimeConvert = Func.TimeConvert;
Rand = Func.Rand;
UserList = Func.UserList;
AddCode = Func.AddCode;
EatFish = Func.EatFish;
SumBait = Func.SumBait;
SumLuk = Func.SumLuk;
SumFishing = Func.SumFishing;
BaitPrice = Func.BaitPrice;
RodpopPrice = Func.RodpopPrice;
NumberString = Func.NumberString;
WeightConvert = Func.WeightConvert;

/** Load Configurations **/
const Module = require('Fishing2/const');
const R = Module.R;
const li = Module.li;
const help = Module.help;
const path = Module.path;
const cmd = Module.cmd;
const cmd_result = Module.cmd_result;
const cf = Module.cf;

/** Load Lists **/
const List = require('Fishing2/list');
const shop = List.shop;
const map = List.map;
const fish = List.fish;
const rank = List.rank;
const bait = List.bait;
const rodList = List.rods;  // 낚싯대목록
const baitList = Object.keys(bait);  // 미끼목록

/** 가입시 특별보상 지급할 유저명 **/
const tester = ['주인','방장','도라지'];

function response(r, msg, s, iGC, replier, imageDB) {

let Hash=java.lang.String(imageDB.getProfileImage()).hashCode();

/******** 내부 함수 ********/
/** 이름, 해시 체크 **/
function Check(userdata){
    if(!userdata){
        let zzuser = JSON.parse(FS.read(path+'휴면/'+s+'/user.json'));
        if(!zzuser){
            replier.reply('• '+s+'님은 회원이 아니예요.');
            return 0;
        } else{
            replier.reply([
                '• '+s+'님은 휴면상태로 전환되었어요.',
                '• "'+cmd.undormant[0]+'" 를 입력하세요.'
            ].join('\n'));
            return 0;
        }
    } if(!userdata.hash.includes(Hash)){
        replier.reply([
            '• '+s+'님의 정보가 일치하지 않아요.',
            '• "'+cmd.certify[0]+'"을 입력하세요.'
        ].join('\n'));
        return 0;
    } if(!userdata.login){
        replier.reply('• '+s+'님, 먼저 입장 해주세요.');
        return 0;
    }
    return 1;
}

/** 레벨업 **/
function LevelUp(Data, Collect, fS){
    if(Data.lv >= cf.maxLv) Data.exp = Number(Data.maxExp);  // 최대레벨이면 더이상 경험치 획득 금지
    else{
        Data.exp -= Data.maxExp;  // 현재 경험치에서 목표경험치만큼 제거
        Data.maxExp = Number(Math.pow(Data.lv, 2) + Data.maxExp);  // 목표경험치 증가
        Data.maxHp += cf.hpCoe;  // 최대체력 증가
        Data.luk += cf.lukCoe;  // 행운 증가
        Data.box.capacity += cf.boxCoe;  // 양동이용량 증가
        Data.lv++;  // 레벨 증가
        fS.move = [];  // 낚시터이동 레벨 리스트
        fS.baitA = ObValue(bait).map(e=>Number(e*cf.baitLv|0));  // 미끼착용 레벨 리스트
        Object.keys(fish).forEach(e=>fS.move.push(fish[e].lv));
        if(Data.lv / 5 == parseInt(Data.lv / 5)) Data.bag.capacity++;  // 5레벨마다 가방용량 1 증가
        fS.levelupContent = [];  // 추가내용 출력배열
        if(fS.move.some(e=>e==Data.lv)) fS.levelupContent.push('※ 새로운 낚시터로 이동할 수 있어요.');
        if(fS.baitA.some(e=>e==Data.lv)) fS.levelupContent.push('※ 새로운 미끼를 사용할 수 있어요.');
        if(Data.lv == cf.minGiveMoney) fS.levelupContent.push('※ 송금 기능을 사용할 수 있어요.');
        if(Data.lv == cf.maxLv){
            if(!Collect.칭호.includes('만렙을 찍어본')){
                Collect.칭호.push('만렙을 찍어본');
                fS.levelupContent.push('※ 새로운 칭호를 획득했어요.');
                FS.write(path+'user/'+s+'/col.json', JSON.stringify(Collect, null, 4));
            } else ;
        }
        return replier.reply('• '+Name(Data)+'님이 레벨업 했어요!\n• Lv.'+(Data.lv-1)+' ➡ Lv.'+Data.lv+
            (!fS.levelupContent.length?'':('\n'+fS.levelupContent.join('\n')))+
            (Data.lv >= cf.rebirthLv?'\n• 환생이 가능해요.':''));
    }
    return 0;
}


/** 가입확인 **/
if(r == s && !iGC && msg == '가입확인'){
//try{
    if(!fishJoin[s]) return;
    if(!fishJoin[s].on) return;
    let code = AddCode();
    /* 유저 데이터 */
    let data = {
        login : 1,  // 접속상태
        name : s,  // 유저명
        hash : [fishJoin[s].hash],  // 해시코드
        code : code,  // 보안코드
        lv : 1,  // 레벨
        rank : '뉴비',  // 칭호
        gold : (tester.includes(s)?100000:10000),  // 돈
        point : 0,  // 포인트
        hp : 10, maxHp : 10,  // 체력
        exp : 0, maxExp : 10,  // 경험치
        rest : 0,  // 휴식시간 단축
        luk : 5,  // 행운수치
        map : '개울가',  // 현재위치
        restOn : 0,  // 휴식유무
        restTime : 0,  // 휴식시간
        rodPop : 0,  // 낚싯대 뽑은 횟수
        rebirth : {
            on : 0,  // 환생유무
            gold : 0,
            exp : 0,
            size : 0
        },  // 환생객체
        bestFish : {
            name : '없음',
            size : 0,
            order : 0
        },
        bait : {
            lv : 1,  // 미끼레벨
            name : '파리',  // 미끼명
            num : 20, maxNum : 20  // 미끼수량
        },
        rod : {
            name : (tester.includes(s)?'🎣테스터낚싯대':'낚싯대'),  // 낚싯대명
            class : '일반',  // 등급
            order : (tester.includes(s)?2:1),  // 등급숫자
            success : (tester.includes(s)?15:5),  // 추가성공률
            time : [(tester.includes(s)?-30:0), (tester.includes(s)?-30:0)],  // 추가 낚시시간[최소,최대]
            rest : (tester.includes(s)?5:0),  // 추가 휴식시간
            hp : (tester.includes(s)?10:0),  // 추가 체력
            luk : (tester.includes(s)?30:0),  // 추가 행운
            lock : 0  // 잠금여부
        },
        fishing : {
            count : 0,  // 낚시횟수
            success : 0,  // 낚시성공횟수
            fail : 0  // 낚시실패횟수
        },
        time : {
            join : Number(Date.now()),  // 최초 가입시간
            last : Number(Date.now())  // 마지막 퇴장시간
        },
        /* 양동이 */
        box : {
            capacity : 10,  // 용량
            lock : [],  // 잠금된 물고기
            fish : []  // 잡은 물고기
        },
        /* 가방 */
        bag : {
            capacity : 5,  // 보관함 용량
            rod : [],  // 낚싯대 보관함
            rodTicket : (tester.includes(s)?1:0),  // 낚싯대뽑기권 수량
            double : (tester.includes(s)?5:0),  // 행운의부적
            soul : 0,  // 영혼석 (환생 후 출력)
            synthesis : 0,  // 합성가루
            tiger : 0  // 이벤트 : 호랑이
        },
        /* 낚시왕 경연대회 */
        contest : {
            count : 0,
            num : 0,
            fish : {
                name : 0,
                size : 0
            }
        },
        /* 개별 설정 */
        config : {
            autoSort : 1  // 자동정렬 기능(기본 On)
        }
    };
    let col = {
        일반 : [], 희귀 : [], 전설 : [], 신화 : [], 초월 : [], 무한:[], 잡템 : [],
        칭호 : (tester.includes(s)?['테ᩚ스ᩚ터ᩚ']:[]),
        rod : {무한 : [], 초월 : [], 신화 : [], 전설 : [], 희귀 : [], 일반 : []}
    };
    let log = JSON.parse(FS.read(path+'log.json'));
    if(!log) log = [];
    log.push([
        new java.text.SimpleDateFormat("[yyyy-MM-dd, HH:mm:ss]").format(new Date()),
        ' ➡ '+s+'님이 가입함.'
    ].join('\n'));
    FS.write(path+'log.json', JSON.stringify(log, null, 4));
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(data, null, 4));
    FS.write(path+'user/'+s+'/col.json', JSON.stringify(col, null, 4));
    fishJoin[s] = 0;
    replier.reply([
        '• '+s+'님, 가입을 축하드려요!'+
        (!tester.includes(s)?'':more+'\n'+[
            '※ '+s+'님은 테스터이며, 특별보상을 드립니다.',
            '  • [희귀] 🎣테스터낚싯대',
            '  • 1만라지',
            '  • 🎫낚싯대뽑기권 1장',
            '  • 🧧행운의부적 5개',
            '  • 테스터 전용 칭호'
        ].join('\n'))
    ].join('\n'));
    replier.reply([
        '※ 아래의 보안코드를 꼭 보관하세요.',
        '• 프로필사진을 바꾸면 인식하지 않아요.',
        '• 아래의 코드는 프로필사진 변경 후 반드시 필요한 코드예요.'
    ].join('\n'));
    replier.reply(code);
    //replier.reply(fishJoin[s].room, '• '+s+'님이 가입했어요.');
    fishJoin[s] = null;
    return;
/*} catch(e){
    replier.reply('• 서버가 재시작되었어요. 기존 방에서 다시 "가입"을 입력해 주세요.');
    return;
}*/
}


/** 작동방 확인 **/
//if(!R.includes(r)) return;

/** 자동 컴파일 **/
if(msg){
    if(Num[r] == undefined) Num[r] = 0;
    Num[r]++;
    if(Num[r] > 100){
        if(fishOn == undefined || ObValue(fishOn).every(e=>!e)){
            Api.compile('New_낚시');
            Num[r] = 0;
            //replier.reply('※ 낚시터를 청소했어요.');
        } else ;
    } else ;
}



/** 이벤트 : 낚시왕 경연대회 **/
if(cmd.playContest.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s] == undefined) fishOn[s] = 0;
    Check(me[s]);
    if(fishOn[s] == 2 || fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].restOn){
        replier.reply('• '+s+'님은 휴식중이예요.');
        return;
    } if(me[s].hp <= 0){
        replier.reply('• '+s+'님의 체력이 부족해요.');
        return;
    }
    if(me[s].gold < 10000){
        replier.reply('• '+s+'님은 대회 참가권을 살 돈이 부족해요.');
        return;
    }
    fishOn[s] = 1;  // 낚시중으로 변경
    me[s].gold -= 10000;
    let fishQ = fish[map.list[map.list.length-1]].list;
    fishQ = fishQ.concat(fish.trash.list, rodList, baitList);
    replier.reply('• '+Name(me[s])+'님이 '+And(me[s].rod.name,'을','를')+' 던졌어요.');
    f[s] = {};
    f[s].time = Number(parseInt(Rand(cf.time[0]+me[s].rod.time[0], cf.time[1]+me[s].rod.time[1]))/3*1000);  // 낚시시간
    f[s].partTime = Number(parseInt(f[s].time / 10));  // 낚시시간 쪼개기
    f[s].markTime = Number(Date.now()) + f[s].time;  // 목표시간
    java.lang.Thread.sleep(f[s].partTime);
    while(fishOn[s] && Number(Date.now()) < f[s].markTime){
        if(fishOn[s] == 2){
            fishOn[s] = 0; f[s] = null;
            replier.reply('• '+s+'님의 낚시가 중단되었어요.');
            return;
        }
        java.lang.Thread.sleep(f[s].partTime);
    }
    
    if(fishOn[s] == 2){
        fishOn[s] = 0; f[s] = null;
        replier.reply('• '+s+'님의 낚시가 중단되었어요.');
        return;
    }
    f[s].fish = {
        name : fishQ[Math.random()*fishQ.length|0]
    };
    f[s].rand = Rand(0, 100);
    if(f[s].rand <= 2) f[s].fish.size = Rand(1, 9900000000000000000000);
    else if(f[s].rand <= 6) f[s].fish.size = Rand(1, 99000000000000000);
    else if(f[s].rand <= 12) f[s].fish.size = Rand(1, 990000000000);
    else if(f[s].rand <= 20) f[s].fish.size = Rand(1, 999000000);
    else if(f[s].rand <= 30 || s=='Jun O') f[s].fish.size = Rand(1, 990000);
    else if(f[s].rand <= 45) f[s].fish.size = Rand(1, 99000);
    else if(f[s].rand <= 65) f[s].fish.size = Rand(1, 9900);
    else f[s].fish.size = Rand(1, 100);
    if(f[s].fish.size < 0) f[s].fish.size *= (-1);
    f[s].fish.size = parseInt(f[s].fish.size);
    let contest = JSON.parse(FS.read(path+'contest.json'));
    if(me[s].contest.count == contest.count){
        if(me[s].contest.fish.size < f[s].fish.size) me[s].contest.fish = f[s].fish;
        else ;
    } else{
        me[s].contest.count = contest.count;
        me[s].contest.num = 0;
        me[s].contest.fish = f[s].fish;
    }
    me[s].hp--;
    me[s].contest.num++;
    me[s].time.last = Number(Date.now());  // 마지막 낚시시간 갱신
    if(me[s].contest.num == 1){
        me[s].point += 5000;
        me[s].bag.double++;
        replier.reply(s + " 님 낚시대회 출석 보상 \n5,000 포인트,\n🧧행운의부적 지급!!");
    }  
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    fishOn[s] = 0;
    replier.reply('• '+Name(me[s])+'님이 '+And(f[s].fish.name,'('+NumberString(f[s].fish.size,2)+'Cm)을','('+NumberString(f[s].fish.size,2)+'Cm)를')+' 낚았어요,');
    f[s] = null;
    
    /* 대회 종료 및 다음회차 개최 */
    let con = JSON.parse(FS.read(path+'contest.json'));
    if(con == undefined){
        con = {
            day : Number(Date.now()),
            count : 1,
            record : []
        };
        FS.write(path+'contest.json', JSON.stringify(con, null, 4));
        replier.reply('※ 낚시왕 선발대회 DATA 생성완료!');
        return;
    }
    if(Number(Date.now()) >= (cf.contestTime * 3600000) + con.day){
        let allUsers = [];  // 모든 참가자
        for(let i=0; i<UserList(path).length; i++){
            if(UserList(path)[i].contest.count == con.count) allUsers.push(UserList(path)[i]);
            else ;
        }
        if(allUsers.length <= 3) return;
        let sumNum = 0;  // 낚시횟수 합계
        for(let i=0; i<allUsers.length; i++) sumNum += allUsers[i].contest.num;
        allUsers.sort((a,b)=>b.contest.fish.size - a.contest.fish.size);  // 크기순 정렬
        let users = allUsers.slice(0,5);  // 순위권 참가자
        let best = [];  // 순위권 참가자 Data
        for(let i=0; i<users.length; i++){
            best.push({
                name : users[i].name,
                fish : users[i].contest.fish.name,
                size : users[i].contest.fish.size,
                num : users[i].contest.num
            });
        }
        best[0].gold = parseInt(Math.pow(allUsers.length, 4) * ((100 - 100 / (sumNum / best[0].num)) * 0.5 / 1));  // 1등 상금
        best[1].gold = parseInt(Math.pow(allUsers.length, 4) * ((100 - 100 / (sumNum / best[1].num)) * 0.5 / 2));  // 2등 상금
        best[2].gold = parseInt(Math.pow(allUsers.length, 4) * ((100 - 100 / (sumNum / best[2].num)) * 0.5 / 4));  // 3등 상금
        best[3].gold = parseInt(Math.pow(allUsers.length, 4) * ((100 - 100 / (sumNum / best[3].num)) * 0.5 / 8));  // 1등 상금
        best[4].gold = parseInt(Math.pow(allUsers.length, 4) * ((100 - 100 / (sumNum / best[4].num)) * 0.5 / 16));  // 1등 상금
        users.forEach((e,i)=>{
            e.gold += best[i].gold;  // 상금 전달
            FS.write(path+'user/'+users[i].name+'/user.json', JSON.stringify(users[i], null, 4));  // Data 저장
        });
        con.record.push({
            count : con.count,
            name : best[0].name,
            fish : best[0].fish,
            size : best[0].size,
            gold : best[0].gold
        });
        con.count++;
        con.day = Number(Date.now());
        FS.write(path+'contest.json', JSON.stringify(con, null, 4));
        let medal = ['🥇', '🥈', '🥉'];
        Module.R.forEach(e=>replier.reply(e, [
            '※ 제 '+(con.count-1)+'회 낚시왕 선발대회 종료!',
            '• 낚시왕은 '+best[0].name+'님이예요!!'+more,,
            best.map((e,i)=>[
                medal[i]+' '+e.name,
                '• 상금 : '+NumberString(e.gold)+'라지',
                '• 도전횟수 : '+e.num+'회 ('+(100/(sumNum/e.num)).toFixed(1)+'%)'
            ].join('\n')).join('\n'+li[2]+'\n'),,,
            '[ 상금 계산식 ]',﻿            
            '1️⃣ : [참여자수]⁴ × ((100 - 도전횟수비율) × 0.5 / 1)',﻿             
            '2️⃣ : [참여자수]⁴ × ((100 - 도전횟수비율) × 0.5 / 2)',﻿             
            '3️⃣ : [참여자수]⁴ × ((100 - 도전횟수비율) × 0.5 / 4)',             
            '4️⃣ : [참여자수]⁴ × ((100 - 도전횟수비율) × 0.5 / 8)',             
            '5️⃣ : [참여자수]⁴ × ((100 - 도전횟수비율) × 0.5 / 16)',                        '# 도전횟수비율 = 100 ÷ (전체횟수 ÷ 유저횟수)'
        ].join('\n')));
    } else ;
    return;
}

/** 이벤트 : 낚시왕 경연대회 순위 **/
try{
if(cmd.contestScore.includes(msg)){
    let score = JSON.parse(FS.read(path+'contest.json'));
    if(score == undefined){
        score = {
            day : Number(Date.now()),
            count : 1,
            record : []
        };
        FS.write(path+'contest.json', JSON.stringify(score, null, 4));
        replier.reply('※ 낚시왕 선발대회 DATA 생성완료!');
        return;
    }
    let users = [];  // 도전한 유저들 Data
    let allNum = 0;  // 도전횟수 합계
    for(let i=0; i<UserList(path).length; i++)
        if(UserList(path)[i].contest.count == score.count) users.push(UserList(path)[i]);
    for(let i=0; i<users.length; i++) allNum += users[i].contest.num;
    users.sort((a,b)=>b.contest.fish.size - a.contest.fish.size);
    let endTime = score.day+(cf.contestTime*3600000)-Number(Date.now());
    replier.reply([
        '🎊 제 '+score.count+'회 낚시왕 선발대회'+more,li[3],
        '⏰ '+(endTime<1000?'종료 임박 !!':(TimeConvert(endTime)+'후 종료.')),,
        li[3],'√ 상금 계산식',li[3],
        '[ 상금 계산식 ]',﻿            
            '1️⃣ : [참여자수]⁴ × ((100 - 도전횟수비율) × 0.5 / 1)',﻿             
            '2️⃣ : [참여자수]⁴ × ((100 - 도전횟수비율) × 0.5 / 2)',﻿             
            '3️⃣ : [참여자수]⁴ × ((100 - 도전횟수비율) × 0.5 / 4)',             
            '4️⃣ : [참여자수]⁴ × ((100 - 도전횟수비율) × 0.5 / 8)',             
            '5️⃣ : [참여자수]⁴ × ((100 - 도전횟수비율) × 0.5 / 16)',        '# 도전횟수비율 = 100 ÷ (전체횟수 ÷ 유저횟수)',,
        li[3],'√ 명령어',li[3],
        '• '+cmd.playContest[0]+'  ---  대회참여',,
        li[3],'√ 순위',li[3],
        users.map((e,i)=>[
            '『'+(++i)+'등』 '+Name(e),
            ' ┗ '+e.contest.fish.name+' ('+NumberString(e.contest.fish.size, 2)+'Cm)',
            ' ┗ 도전횟수 : '+e.contest.num+'회 ('+(100 / (allNum / e.contest.num)).toFixed(1)+'%)'+
            (i == 1 ? 
            '\n ┗ 예상상금 : '+NumberString(parseInt(Math.pow(users.length, 4) * (100 - ((100 / (allNum / e.contest.num)))) * 0.5 / 1), 2)+'라지' :
            (i == 2 ?
            '\n ┗ 예상상금 : '+NumberString(parseInt(Math.pow(users.length, 4) * (100 - ((100 / (allNum / e.contest.num)))) * 0.5 / 2), 2)+'라지' :
            (i == 3 ?
            '\n ┗ 예상상금 : '+NumberString(parseInt(Math.pow(users.length, 4) * (100 - ((100 / (allNum / e.contest.num)))) * 0.5 / 4), 2)+'라지' :
            (i == 4 ?
            '\n ┗ 예상상금 : '+NumberString(parseInt(Math.pow(users.length, 4) * (100 - ((100 / (allNum / e.contest.num)))) * 0.5 / 8), 2)+'라지' :
            (i == 5 ?
            '\n ┗ 예상상금 : '+NumberString(parseInt(Math.pow(users.length, 4) * (100 - ((100 / (allNum / e.contest.num)))) * 0.5 / 16), 2)+'라지' : '')))))
        ].join('\n')).join('\n\n'),,,
        li[3],'√ 역대 낚시왕 목록',li[3],
        (!score.record ? '• 없음' : score.record.map(e=>[
            '[ 제 '+e.count+'회 낚시왕 ]',
            '• 유저명 : '+e.name,
            '• '+e.fish+' ('+NumberString(e.size, 3)+'Cm)',
            '• 상금 '+NumberString(e.gold)+'라지'
        ].join('\n')).join('\n'+li[3]+'\n'))
    ].join('\n'));
    return;
}
} catch(error){
    replier.reply([
        '※ 오류발생'+more,
        '• '+error.name,
        '• '+error.message,
        '• '+error.lineNumber
    ].join('\n'));
    return;
}


/** 낚시 **/
try{
if(cmd.play.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s] == undefined) fishOn[s] = 0;
    Check(me[s]);
    if(fishOn[s] == 2 || fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].restOn){
        replier.reply('• '+s+'님은 휴식중이예요.');
        return;
    } if(me[s].hp <= 0){
        replier.reply('• '+s+'님의 체력이 부족해요.');
        return;
    } if(me[s].bait.num <= 0){
        replier.reply('• '+s+'님의 미끼가 부족해요.');
        return;
    } if(me[s].box.fish.length >= me[s].box.capacity){
        replier.reply('• '+s+'님의 양동이가 가득찼어요.');
        return;
    }
    
    fishOn[s] = 1;  // 낚시중으로 변경
    replier.reply('• '+Name(me[s])+'님이 '+And(me[s].rod.name,'을','를')+' 던졌어요.');
    f[s] = {};
    f[s].time = Number(parseInt(Rand(cf.time[0]+me[s].rod.time[0], cf.time[1]+me[s].rod.time[1]))*1000);  // 낚시시간
    if(me[s].rebirth.on && f[s].time > cf.rebirthTime+10000) f[s].time -= cf.rebirthTime;  // 환생자일때 낚시시간이 단축시간보다 10초 길면 단축
    f[s].partTime = Number(parseInt(f[s].time / 20));  // 낚시시간 쪼개기
    f[s].markTime = Number(Date.now()) + f[s].time;  // 목표시간
    //replier.reply('• 예상시간 : '+TimeConvert(f[s].markTime-Number(Date.now())));
    java.lang.Thread.sleep(f[s].partTime);
    while(fishOn[s] && Number(Date.now()) < f[s].markTime){
        if(fishOn[s] == 2){
            fishOn[s] = 0; f[s] = null;
            replier.reply('• '+s+'님의 낚시가 중단되었어요.');
            return;
        } java.lang.Thread.sleep(f[s].partTime);
    }
    
    if(fishOn[s] == 2){
        fishOn[s] = 0; f[s] = null;
        replier.reply('• '+s+'님의 낚시가 중단되었어요.');
        return;
    }
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    f[s].baitA = SumBait(me[s]);  // 미끼수치 합산
    f[s].luk = SumLuk(me[s]);  // 행운수치 합산
    f[s].rate = SumFishing(me[s]);  // 낚시 성공률
    if(f[s].luk > Math.random()*500) f[s].rate += 5;  // 행운적용시 낚시 성공률 5% 증가
    
    /* 낚시실패 */
    if(f[s].rate < Math.random()*100){
        f[s].fish = {
            name : fish.trash.list[Math.random()*fish.trash.list.length|0],
            size : Number(Rand(fish.trash.size[0], fish.trash.size[1]).toFixed(1)),
            class : '잡템', order : 0
        };  // 낚은 물고기 Data
        f[s].fish.gold = Number(f[s].fish.size * cf.fish_gold.잡템| 0);  // 물고기 판매가격
        
        /* 환생 관련 Code */
        if(!!me[s].rebirth.size) f[s].fish.size = Number((f[s].fish.size * 1.5).toFixed(1));
        if(!!me[s].rebirth.gold) f[s].fish.gold *= 2;
        
        /* 반복 : 신규잡템 낚기 */
        co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));  // 도감파일
        if(co[s].잡템.includes(f[s].fish.name)){
            f[s].trashRedice = Number(cf.trashRepop);
            while(f[s].trashRedice > 0 && co[s].잡템.includes(f[s].fish.name)){
                f[s].fish.name = fish.trash.list[Math.random()*fish.trash.list.length|0];
                f[s].trashRedice--;
            }
        } else ;
        
        me[s].fishing.fail++;  // 실패 1회 증가
    }
    
    /* 낚시성공 */
    else{
        /* 물고기 등급 결정 */
        f[s].class = '일반'; f[s].order = 1;
        if(f[s].luk >= Rand(0, cf.fishing.filter[0])){
            if(Math.random()*100 <= 1) ;
            else if(f[s].luk >= Rand(0, Number(cf.fishing.filter[0]))){
                f[s].class = '희귀'; f[s].order = 2;
            }
        } if(f[s].luk >= Rand(0, cf.fishing.filter[1])){
            if(Math.random()*100 <= 1) ;
            else if(f[s].luk >= Rand(1, Number(cf.fishing.filter[1])) && f[s].class=='희귀'){
                f[s].class = '전설'; f[s].order = 3;
            }
        } if(f[s].luk >= Rand(0, cf.fishing.filter[2])){
            if(Math.random()*100 <= 1) ;
            else if(f[s].luk >= Rand(2, Number(cf.fishing.filter[2])) && f[s].class=='전설'){
                f[s].class = '신화'; f[s].order = 4;
            }
        } if(f[s].luk >= Rand(0, cf.fishing.filter[3]) && f[s].class=='신화'){
            f[s].class = '초월'; f[s].order = 5;
        } if(SumFishing(me[s]) >= 100 && f[s].class=='초월' && Rand(0,100)<=20){
            f[s].class = '무한'; f[s].order = 6;
        }
        
        /* 잡은 물고기 Data */
        f[s].fish = {
            name : fish[me[s].map].list[Math.random()*fish[me[s].map].list.length|0],  // 물고기이름
            size : Number(Rand(fish[me[s].map].size[0], fish[me[s].map].size[1]).toFixed(1)),
            class : f[s].class, order : f[s].order
        };
        
        /* 물고기 크기 증가 Code (행운에 따라 10%씩 최대 10회 증가) */
        for(let i=0; i<10; i++){
            f[s].size = 200;  // 물고기크기 필터 초기값
            if(f[s].luk >= Rand(1,f[s].size)) f[s].fish.size += Number(f[s].fish.size*0.1);
            f[s].size += 50;  // 물고기크기 필터 증분값
        }
        
        /* 물고기 길이 & 가격 완성 */
        f[s].fish.size = Number(f[s].fish.size.toFixed(1));  // 물고기길이
        f[s].fish.gold = parseInt(f[s].fish.size)*cf.fish_gold[f[s].fish.class]|0;  // 물고기가격
        
        /* 환생 관련 */
        if(!!me[s].rebirth.size) f[s].fish.size = Number((f[s].fish.size * 1.5).toFixed(1));
        if(!!me[s].rebirth.gold) f[s].fish.gold *= 2;
        
        /* 신규 물고기 낚기 */
        co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));  // 도감파일
        if(co[s][f[s].fish.class].includes(f[s].fish.name)){
            f[s].fishRedice = Number(cf.fishRepop);
            while(f[s].fishRedice > 0 && co[s][f[s].fish.class].includes(f[s].fish.name)){
                f[s].fish.name = fish[me[s].map].list[Math.random()*fish[me[s].map].list.length|0];
                f[s].fishRedice--;
            }
        } else ;  // 낚은적 없는 물고기가 나올때까지 제한횟수 내에서 다시 굴림
        me[s].fishing.success++;  // 성공 1회 증가
    }
    /* 성공 & 실패 결정 Code 종료 */
    
    
    if(me[s].fishing.count != me[s].fishing.success + me[s].fishingfail) me[s].fishing.count = me[s].fishing.success + me[s].fishing.fail;  // 누적정보 보정
    if(!f[s].fish) ;  // 잡은 물고기가 없으면 건너뜀
    else{
        /* 경험치 결정 */
        f[s].exp = Number(f[s].fish.size * cf.fish_exp[f[s].fish.class]|0);  // 획득경험치
        if(!!me[s].rebirth.exp) f[s].exp *= 2;  // 환생 : 경험치 두배
        
        /* 물고기 두마리 결정 */
        f[s].double = 0;  // 물고기 두마리 낚기 on/off
        if(Math.random()*100 <= me[s].bag.double * cf.doubleFish + me[s].net.lv) f[s].double = 1;  // 물고기 두마리 낚기 조건 만족시 on
        
        f[s].content = [];  // 추가 내용
        
        /* 도감등록 : 신규 물고기 낚을시 */
        co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));  // 도감파일
        if(!co[s][f[s].fish.class].includes(f[s].fish.name)){
            co[s][f[s].fish.class].push(f[s].fish.name);
            co[s][f[s].fish.class].sort();
            FS.write(path+'user/'+s+'/col.json', JSON.stringify(co[s], null, 4));
            f[s].content.push('※ 새로운 '+(!f[s].fish.order?'쓰레기':'물고기')+' 발견!');
            let fishs = fish;
            let keys = Object.keys(fishs);
            let arr = [];
            for(let i=0; i<keys.length-1; i++)
                fishs[keys[i]].list.forEach(e=>arr.push(e));
            arr = Array.from(new Set(arr));  // 잡템 제외한 모든 물고기
            if((f[s].fish.class != '잡템' && co[s][f[s].fish.class].length >= Math.ceil(arr.length*(cf.colFishPer*0.01))) || (f[s].fish.class == '잡템' && co[s][f[s].fish.class].length >= Math.ceil(fish.trash.list.length*(cf.colTrashPer*0.01))))
                f[s].content.push('※ '+f[s].fish.class+'등급 물고기도감보상을 받을수 있어요.');
        }
        
        me[s].bait.num--;  // 미끼수량 1 감소
        me[s].box.fish.push(f[s].fish);  // 양동이에 물고기 넣기
        if(f[s].double) me[s].box.fish.push(f[s].fish);  // 두마리 낚기 on : 물고기 한번더 넣기
        me[s].exp += (f[s].double?(f[s].exp*2):f[s].exp);  // 경험치 획득
        
        /* 개인기록 갱신 */
        if(f[s].fish.order >= me[s].bestFish.order && f[s].fish.size > me[s].bestFish.size || f[s].fish.order > me[s].bestFish.order){
            me[s].bestFish.name = '['+f[s].fish.class+'] '+f[s].fish.name;
            me[s].bestFish.size = Number(f[s].fish.size);
            me[s].bestFish.order = f[s].fish.order;
            f[s].content.push('※ 개인기록이 갱신되었어요.');
        }
                    
        /* 추가보상 획득 Code */
        f[s].reward = [];  // 추가보상란
        if(Math.random()*100 < cf.rodTicket+(f[s].luk/100)){
            me[s].bag.rodTicket++;  // 낚싯대뽑기권 획득
            f[s].reward.push('🎫낚싯대뽑기권');
        }  // 낚싯대뽑기권 획득
        if(Math.random()*100 < cf.double+(f[s].luk/660)){
            me[s].bag.double++;
            f[s].reward.push('🧧행운의부적');
        }  // 행운의부적 획득
        if(!!me[s].rebirth.on && Math.random()*2000 < f[s].luk){
            let numZ = Number(Math.random()*5+1|0);
            me[s].bag.soul += numZ;
            f[s].reward.push('🔮영혼석('+numZ+')');
        }  // 환생 : 영혼석 획득
        
        /* 물고기 포획 출력 */
        replier.reply([
            '• '+Name(me[s])+'님이 ['+f[s].fish.class+']'+(!f[s].fish.order ? And(f[s].fish.name,'을','를') : 
                And(f[s].fish.name, '('+Div(f[s].fish.size)+'Cm)을','('+Div(f[s].fish.size)+'Cm)를'))+(f[s].double?' 2'+(f[s].fish.class=='잡템'?'개':'마리'):'')+' 낚았어요.'+
                (!(f[s].fish.size * cf.fish_exp[f[s].class]|0) ? '' : ('\n• '+(f[s].double?NumberString(f[s].exp*2):NumberString(f[s].exp))+'경험치 획득.'))+
                (!f[s].reward.length?'':'\n※ '+f[s].reward.join(', ')+' 획득.')+
                (!f[s].content.length?'':'\n'+f[s].content.join('\n'))
        ].join('\n'));
        
        /* 경험치가 가득차면 레벨업 */
        if(me[s].exp >= me[s].maxExp) LevelUp(me[s], co[s], f[s]);
    }
    me[s].hp--;  // 체력 1 감소
    me[s].fishing.count++;  // 낚시횟수 1 증가
    me[s].time.last = Number(Date.now());  // 마지막 낚시시간 갱신
    if(me[s].config.autoSort){
        me[s].box.fish.sort((a,b)=>b.order - a.order);  // 등급순으로 정렬
        me[s].box.fish.sort((a,b)=>(b.order==a.order?(b.gold-a.gold):-1));  // 크기별로 정렬
    }  // 자동정렬
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    f[s] = null; fishOn[s] = 0;
    return;
}
} catch(error){
    replier.reply([
        '※ 오류발생'+more,
        '• '+error.name,
        '• '+error.message,
        '• '+error.lineNumber
    ].join('\n'));
    return;
}


/** 낚시중단 **/
if(cmd.stop.includes(msg)){
    if(!fishOn[s]) replier.reply('• '+s+'님은 낚시중이 아니예요.');
    else{
        me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
        if(!Check(me[s])) return;
        fishOn[s] = 2;
        replier.reply('• '+Name(me[s])+'님이 낚시중단을 예약했어요.');
    }
    return;
}


/** 도움말 **/
if(cmd.help.includes(msg)){
    replier.reply([
        '💡 낚시터 도움말'+more,li[3],
        help.join('\n')
    ].join('\n'));
    return;
}

/** 명령어출력 **/
if(cmd.cmd.includes(msg)){
    replier.reply(cmd_result.join('\n'));
    return;
}

/** 설정값출력 **/
if(cmd.config.includes(msg)){
    replier.reply(Module.cf_result.join('\n'));
    return;
}


/** 가입 **/
if(cmd.join.includes(msg)){
    let data = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!!data){
        replier.reply('• '+s+'님은 이미 가입했어요.');
        return;
    } if(s.includes('/')){
        replier.reply('• '+s+'님, 슬래시(/)가 포함된 닉네임은 가입불가능해요ㅜㅜ');
        return;
    }
    let dataA = JSON.parse(FS.read(path+'휴면/'+s+'/user.json'));
    if(!dataA) ;
    else{
        replier.reply([
            '• '+s+'님은 휴면상태의 계정이 있어요.',
            '• "'+cmd.undormant[0]+'" 를 입력하세요.'
        ].join('\n'));
        return;
    }
    fishJoin[s] = {};
    fishJoin[s].on = 1;
    fishJoin[s].hash = Number(Hash);
    fishJoin[s].room = r;
    replier.reply('• '+s+'님, 저를 눌러 1:1 채팅방으로 오셔서 "가입확인"을 입력하세요.\n• 이곳과 같은 이름이어야 인식해요.');
    return;
}


/** 휴면해제 **/
if(cmd.undormant.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'휴면/'+s+'/user.json'));
    if(!me[s]){
        me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
        if(!me[s]){
            replier.reply('• '+s+'님은 회원이 아니예요.');
            return;
        } if(!me[s].hash.includes(Hash)){
            replier.reply([
                '• '+s+'님의 정보가 일치하지 않아요.',
                '• "'+cmd.certify[0]+'"을 입력하세요.'
            ].join('\n'));
            return;
        }
        replier.reply('• '+s+'님은 휴면계정이 아니예요.');
        return;
    }
    let dataA = JSON.parse(FS.read(path+'휴면/'+s+'/user.json'));
    let colA = JSON.parse(FS.read(path+'휴면/'+s+'/col.json'));
    dataA.time.last = Number(Date.now());
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(dataA, null, 4));
    FS.write(path+'user/'+s+'/col.json', JSON.stringify(colA, null, 4));
    FS.remove(path+'휴면/'+s+'/user.json');
    FS.remove(path+'휴면/'+s+'/col.json');
    java.io.File(path+'휴면/'+s).delete();
    replier.reply('• '+s+'님의 휴면상태가 해제되었어요.');
    return;
}


/** 탈퇴 **/
if(msg == cmd.secede){
    let data = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(data)) return;
    let listFiles=java.io.File(path+'user/'+s).listFiles();
    for(let i=0; i<listFiles.length; i++) FS.remove(listFiles[i]);
    java.io.File(path+'user/'+s).delete();
    let log = JSON.parse(FS.read(path+'log.json'));
    log.push([
        new java.text.SimpleDateFormat("[yyyy-MM-dd, HH:mm:ss]").format(new Date()),
        ' ➡ '+s+'님 탈퇴.'
    ].join('\n'));
    FS.write(path+'log.json', JSON.stringify(log, null, 4));
    replier.reply('• '+s+'님의 탈퇴가 완료되었어요.');
    return;
}


/** 퇴장 (로그아웃) **/
if(cmd.logout.includes(msg)){
    let data = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!data){
        replier.reply('• '+s+'님은 회원이 아니예요.');
        return;
    } if(!data.hash.includes(Hash)){
        replier.reply([
            '• '+s+'님의 정보가 일치하지 않아요.',
            '• "'+cmd.certify[0]+'"을 입력하세요.'
        ].join('\n'));
        return;
    } if(!data.login){
        replier.reply('• '+s+'님은 이미 퇴장했어요.');
        return;
    } if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(data.restOn){
        replier.reply('• '+s+'님은 휴식중이예요.');
        return;
    }
    data.login = 0;
    data.time.last = Number(Date.now());
    let log = JSON.parse(FS.read(path+'log.json'));
    log.push([
        new java.text.SimpleDateFormat("[yyyy-MM-dd, HH:mm:ss]").format(new Date()),
        ' ➡ '+s+'님 퇴장.'
    ].join('\n'));
    FS.write(path+'log.json', JSON.stringify(log, null, 4));
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(data, null, 4));
    replier.reply('• '+Name(data)+'님이 퇴장했어요.');
    return;
}


/** 입장 (로그인) **/
if(cmd.login.includes(msg)){
    let data = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!data){
        replier.reply('• '+s+'님은 회원이 아니예요.');
        return;
    } if(!data.hash.includes(Hash)){
        replier.reply([
            '• '+s+'님의 정보가 일치하지 않아요.',
            '• "'+cmd.certify[0]+'"을 입력하세요.'
        ].join('\n'));
        return;
    } if(data.login){
        replier.reply('• '+s+'님은 이미 입장했어요.');
        return;
    }
    data.login = 1;
    let point = Number(parseInt((Number(Date.now()) - data.time.last) / (cf.pointCoe*1000)));
    data.point += point + point * cf.pointPlus;
    let log = JSON.parse(FS.read(path+'log.json'));
    log.push([
        new java.text.SimpleDateFormat("[yyyy-MM-dd, HH:mm:ss]").format(new Date()),
        ' ➡ '+s+'님 입장.'
    ].join('\n'));
    FS.write(path+'log.json', JSON.stringify(log, null, 4));
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(data, null, 4));
    replier.reply('• '+Name(data)+'님이 입장했어요.' + (!point?'':'\n• '+Div(point)+'포인트 획득.'));
    return;
}


/** 내부함수 - 유저정보 출력 **/
function UserInfo(data){
    let rest = Number(data.rest+data.rod.rest);  // 체력 추가 회복
    let baitA = SumBait(data)  // 미끼수치 합산
    let lukA = SumLuk(data)  // 행운수치 합산
    let rebirthA = [data.rebirth.gold, data.rebirth.exp, data.rebirth.size];  // 환생능력치
    let rebirthB = ['• 골드 획득량 100% 증가', '• 경험치 획득량 100% 증가', '• 물고기 길이 50% 증가'];
    let rebirthC = rebirthA.map((e,i)=>e?rebirthB[i]:'');
    rebirthA = [];
    rebirthC.forEach(e=>!e?0:rebirthA.push(e));
    replier.reply([
        '[ '+Name(data)+' ]'+more,li[3],
        '• 레벨 : '+data.lv,
        '• 체력 : '+Div(data.hp|0)+'/'+Div(data.maxHp+data.rod.hp|0),
        '• 경험치 : '+Div(data.exp)+'/'+Div(data.maxExp),
        '• 보유금 : '+NumberString(data.gold)+'라지',
        '• 포인트 : '+NumberString(data.point|0),
        '• 현재위치 : '+data.map+' ('+(map.info[data.map]*100|0)+'%)',,
        li[3],'√ 스탯',li[3],
        '• 낚시성공률 : '+(SumFishing(data)>100?'100':SumFishing(data).toFixed(1))+'%'+(SumFishing(data)>100?'↑ (':' (')+((SumFishing(data)-SumBait(data))/map.info[data.map]+SumBait(data)).toFixed(1)+'%)',
        '• 낚시시간 : '+TimeConvert((cf.time[0]+data.rod.time[0])*1000)+' ~ '+TimeConvert((cf.time[1]+data.rod.time[1])*1000),
        '• 체력회복 : '+(cf.rest+rest).toFixed(1)+'초당 체력 1 회복 ('+(rest<0?'':'+')+rest.toFixed(1)+'초)',
        '• 행운 : '+Div(SumLuk(data).toFixed(0))+
        (!data.bag.double ? '' : ('\n• 물고기 두마리 낚을 확률 : '+(data.bag.double * cf.doubleFish + me[s].net.lv).toFixed(2)+'%')),,
        li[3],'√ 미끼 (Lv.'+data.bait.lv+')',li[3],
        '※ 다음 미끼강화 비용 : '+(data.bait.lv<cf.maxBaitLv?(NumberString(BaitPrice(data))+'라지'):'최대레벨'),
        '• 이름 : '+data.bait.name+' (+'+SumBait(data).toFixed(1)+'%)',
        '• 수량 : '+Div(data.bait.num)+'/'+Div(data.bait.maxNum + ((data.bait.lv - 1) * cf.baitIncreaseNum)),,
        li[3],'√ 낚싯대',li[3],
        '※ 다음 낚싯대뽑기 비용 : '+NumberString(RodpopPrice(data))+'라지',
        '• 이름 : '+data.rod.name+(data.rod.lock?' 🔒':''),
        '• 등급 : '+data.rod.class+
        (!data.rod.success?'':'\n• 낚시성공률 : '+(data.rod.success<0?'':'+')+data.rod.success.toFixed(1)+'%'+(data.rod.success>=cf.rod.maxSuccessRate?'⍣':''))+
        ((data.rod.time.every(e=>!e))?'':'\n• 낚시시간 : '+(!data.rod.time[0]?'':('[최소 '+(data.rod.time[0]<0?'':'+')+TimeConvert(data.rod.time[0]*1000)+']'+(data.rod.time[0]<=cf.time[0]*(-1)+cf.rod.maxTime[0]?'⍣':'')))+(!data.rod.time[1]?'':(' [최대 '+(data.rod.time[1]<0?'':'+')+TimeConvert(data.rod.time[1]*1000)+']'+(data.rod.time[1]<=cf.time[1]*(-1)+cf.rod.maxTime[1]?'⍣':''))))+
        (!data.rod.rest?'':('\n• 체력회복 : '+(data.rod.rest<0?'':'+')+TimeConvert(data.rod.rest*1000)+(data.rod.rest<=cf.rest*(-1)+cf.rod.maxRest?'⍣':'')))+
        (!data.rod.hp?'':('\n• 체력 : '+(data.rod.hp<0?'':'+')+Div(data.rod.hp)+(data.rod.hp>=cf.rod.maxHp?'⍣':'')))+
        (!data.rod.luk?'':('\n• 행운 : '+(data.rod.luk<0?'':'+')+Div(data.rod.luk)+(data.rod.luk>=cf.rod.maxLuk?'⍣':''))),,
        (!data.rebirth.on?'':[
        li[3],'√ 환생능력',li[3],
        rebirthA.join('\n')
        ].join('\n')+'\n\n')+
        li[3],'√ 누적정보',li[3],
        '• 최고기록 : '+(!data.bestFish.size?'없음':(data.bestFish.name+' ('+Div(data.bestFish.size)+'Cm)')),
        '• 낚싯대뽑은횟수 : '+Div(data.rodPop)+'회',
        '• 총낚시횟수 : '+Div(data.fishing.count)+'회',
        '• 성공횟수 : '+Div(data.fishing.success)+'회',
        '• 실패횟수 : '+Div(data.fishing.fail)+'회',
        '• 누적성공률 : '+(!data.fishing.count?0:(100/(data.fishing.count/data.fishing.success)).toFixed(1))+'%',,
        li[3],'√ 기타정보',li[3],
        '• 가입일시 : '+new java.text.SimpleDateFormat("yyyy년 MM월 dd일 (HH:mm)").format(new Date(data.time.join)),
        '• 보안코드 : '+(!data.code?'없음':data.code.slice(0,3)+'*'.repeat(data.code.length-3))
    ].join('\n'));
}

/** 내정보 **/
if(cmd.info.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    UserInfo(me[s]);
    return;
}

/** 상대정보 **/
if(cmd.info_you.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    let target = msg.substr(cmd.info_you[0].length+1);
    if(target[0] == '@') target = target.slice(1);
    target = UserList(path)[UserList(path).findIndex(e=>e.name==target)];
    if(target == undefined){
        replier.reply('• '+Name(me[s])+'님, 상대정보를 찾을수 없어요.');
        return;
    }
    UserInfo(target);
    return;
}

/** 내부함수 - 양동이 **/
function Box(User, lock, unlock){
    let sumGold = 0;  // 판매금액 합계
    for(let ii=0; ii<User.box.fish.length; ii++)
        sumGold += User.box.fish[ii].gold;
    let boxLock = [
        li[3],'🔒 잠금된 물고기',li[3],
        !User.box.lock.length?'없음':User.box.lock.map((e,i)=>(++i)+' ['+e.class+'] '+e.name+(!e.order?' ':' ('+Div(e.size)+'Cm) ')+'--- '+NumberString(e.gold)+'라지').join('\n')
    ];
    let boxUnlock = [
        li[3],'🐟 판매 가능한 물고기 (총 '+NumberString(sumGold)+'라지)',li[3],
        !User.box.fish.length?'없음':User.box.fish.map((e,i)=>(++i)+' ['+e.class+'] '+e.name+(!e.order?' ':' ('+Div(e.size)+'Cm) ')+'--- '+NumberString(e.gold)+'라지').join('\n')
    ];
    let result
    return (!lock ? '' : ['',
        li[3],'🔒 잠금된 물고기',li[3],
        !User.box.lock.length?'없음':User.box.lock.map((e,i)=>(++i)+' ['+e.class+'] '+e.name+(!e.order?' ':' ('+Div(e.size)+'Cm) ')+'--- '+NumberString(e.gold)+'라지').join('\n')
    ].join('\n')) + (!unlock ? '' : ['',
        li[3],'🐟 판매 가능한 물고기 (총 '+NumberString(sumGold)+'라지)',li[3],
        !User.box.fish.length?'없음':User.box.fish.map((e,i)=>(++i)+' ['+e.class+'] '+e.name+(!e.order?' ':' ('+Div(e.size)+'Cm) ')+'--- '+NumberString(e.gold)+'라지').join('\n')
    ].join('\n'));
}

/** 양동이 **/
if(cmd.box.includes(msg)){
    let data = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(data)) return;
    let capacity = data.box.fish.length;  // 용량합계
    replier.reply([
        '🪣 '+Name(data)+'님의 양동이 ('+capacity+'/'+data.box.capacity+')'+more,li[3],
        '⚠️ "번호-번호" 형식으로 물고기 연속선택 가능',li[3],
        '• '+cmd.fishSell[0],
        '• '+cmd.sortFish[0],
        '• '+cmd.synthesis[0]+' (번호) (번호)',
        '• '+cmd.lock[0]+' (번호)',
        '• '+cmd.unlock[0]+' (번호)',
        '• '+cmd.eatFish[0]+' (번호)',,
        Box(data,1,1)
    ].join('\n'));
    return;
}


/** 낚싯대목록 함수 **/
function ListRod(userdata){
    return !userdata.bag.rod.length?'없음':
        (userdata.bag.rod.map((e,i)=>[
        '['+(++i)+'] '+e.name+' ('+e.class+'등급)'+(e.lock?' 🔒':'')+
        (!e.success?'':'\n  • 낚시성공률 : '+(e.success<0?'':'+')+e.success.toFixed(1)+'%'+(e.success>=cf.rod.maxSuccessRate?' ⍣':''))+
        (e.time.every(f=>!f)?'':('\n  • 낚시시간 : '+(e.time[0]<0?'':'+')+TimeConvert(e.time[0]*1000)+(e.time[0]<=cf.time[0]*(-1)+cf.rod.maxTime[0]?'⍣':'')+' ~ '+(e.time[1]<0?'':'+')+TimeConvert(e.time[1]*1000)+(e.time[1]<=cf.time[1]*(-1)+cf.rod.maxTime[1]?'⍣':'')))+
        (!e.rest?'':('\n  • 체력회복 : '+(e.rest<0?'':'+')+TimeConvert(e.rest*1000)+(e.rest<=cf.rest*(-1)+cf.rod.maxRest?'⍣':'')))+
        (!e.hp?'':('\n  • 체력 : '+(e.hp<0?'':'+')+Div(e.hp)+(e.hp>=cf.rod.maxHp?'⍣':'')))+
        (!e.luk?'':('\n  • 행운 : '+(e.luk<0?'':'+')+Div(e.luk)+(e.luk>=cf.rod.maxLuk?'⍣':'')))
    ].join('\n'))).join('\n'+li[2]+'\n');
}

/** 가방 **/
if(cmd.bag.includes(msg)){
    let data = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(data)) return;
    replier.reply([
        '🎒 '+Name(data)+'님의 가방'+more,li[3],
        '⚠️ 낚싯대뽑기비용 : '+Div(RodpopPrice(data))+'라지',li[2],
        '• '+cmd.popRod[0],
        '• '+cmd.sortRod[0],
        '• '+cmd.lockRod[0]+' (번호)',
        '• '+cmd.changeRod[0]+' (번호)',
        '• '+cmd.sellRod[0]+' (번호) or (*)',
        '• '+cmd.trade[0],,
        li[2],'🎣 낚싯대 ('+data.bag.rod.length+'/'+data.bag.capacity+')',li[2],
        ListRod(data),,
        li[2],'🪙 아이템',li[2],
        '🎫 낚싯대뽑기권 : '+Div(data.bag.rodTicket)+'개',
        '🧧 행운의부적 : '+Div(data.bag.double)+'개',
        '🧂 합성가루 : '+WeightConvert(data.bag.synthesis)+
        (!data.rebirth.on?'':'\n🔮 영혼석 : '+Div(data.bag.soul)+'개'),,li[3],
        '※ 낚싯대뽑기 시 낚싯대뽑기권 우선사용.',
        '※ 행운의부적 1개당 물고기 두마리 낚을 확률 '+cf.doubleFish+'%'
    ].join('\n'));
    return;
}


/** 낚싯대도감 **/
if(cmd.col_rod.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));
    let keyA = Object.keys(co[s].rod);
    replier.reply([
        '🎣 '+Name(me[s])+'님의 낚싯대도감'+more,li[3],
        '• '+cmd.getColRod[0]+' (등급)',,
        keyA.map(e=>[
            li[3],'√ '+e+'등급 ('+co[s].rod[e].length+'/'+rodList.length+') - '+(100/(rodList.length/co[s].rod[e].length)).toFixed(1)+'%'+((100/(rodList.length/co[s].rod[e].length))>=cf.colRodPer?' 🎉보상획득가능':''),li[3],
            (co[s].rod[e].map(e=>'['+e+']').join(', '))+'\n'
        ].join('\n')).join('\n'),,,
        li[3],'⚠️ 낚싯대도감 보상',li[3],
        '※ 모든등급 공통보상 : 낚싯대 뽑기횟수 초기화',li[2],
        Object.keys(cf.collectRod).map(e=>[
            '[ '+e+'등급 보상 ]',
            '• 🎫 낚싯대뽑기권 '+cf.collectRod[e][0]+'장',
            '• 🧧 행운의부적 '+cf.collectRod[e][1]+'개',
            '• '+NumberString(cf.collectRod[e][2])+'라지'
        ].join('\n')).join('\n'+li[2]+'\n')
    ].join('\n'));
    return;
}

/** 낚싯대도감보상받기 **/
if(cmd.getColRod.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));
    let cmdA = msg.split(' ')[1];  // 입력한 등급
    let classA = ['일반', '희귀', '전설', '신화', '초월', '무한'];  // 낚싯대 등급
    if(!classA.includes(cmdA)){
        replier.reply('• '+Name(me[s])+'님, 등급을 정확하게 입력해 주세요.');
        return;
    }
    let rods = rodList;
    if(Math.ceil(rods.length*(cf.colRodPer*0.01)) > co[s].rod[cmdA].length){
        replier.reply('• '+Name(me[s])+'님의 '+cmdA+'등급 낚싯대는 '+((Math.ceil(rods.length*(cf.colRodPer*0.01)))-co[s].rod[cmdA].length)+'개 부족해요.');
        return;
    }
    co[s].rod[cmdA] = [];  // 해당등급 도감 비우기
    me[s].bag.rodTicket += cf.collectRod[cmdA][0];
    me[s].bag.double += cf.collectRod[cmdA][1];
    me[s].gold += cf.collectRod[cmdA][2];
    me[s].rodPop = 0;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    FS.write(path+'user/'+s+'/col.json', JSON.stringify(co[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 '+cmdA+'등급 수집보상으로 🎫낚싯대뽑기권 '+cf.collectRod[cmdA][0]+'장 / 🧧행운의부적 '+cf.collectRod[cmdA][1]+'개 / '+NumberString(cf.collectRod[cmdA][2])+'라지 획득!',
        '• 낚싯대 뽑기횟수 초기화.'
    ].join('\n'));
    return;
}


/** 물고기도감 **/
if(cmd.col_fish.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));
    let fishs = fish;
    let keys = Object.keys(fishs);
    let arr = [];
    for(let i=0; i<keys.length-1; i++)
        fishs[keys[i]].list.forEach(e=>arr.push(e));
    arr = Array.from(new Set(arr));  // 잡템 제외한 모든 물고기
    replier.reply([
        '🌸 '+Name(me[s])+'님의 물고기도감'+more,li[3],
        '⚠️ '+cf.colFishPer+'% 이상 달성시 보상획득 가능 (잡템제외)',li[3],
        '• '+cmd.getColFish[0]+' (등급) --- 보상은 맨아래 참고',,
        li[3],'√ 무한등급 ('+co[s].무한.length+'/'+arr.length+') - '+(100/(arr.length/co[s].무한.length)).toFixed(1)+'%'+((100/(arr.length/co[s].무한.length))>=cf.colFishPer?' 🎉보상획득가능':''),li[3],
        co[s].무한.map(e=>'['+e+']').join(', '),,
        li[3],'√ 초월등급 ('+co[s].초월.length+'/'+arr.length+') - '+(100/(arr.length/co[s].초월.length)).toFixed(1)+'%'+((100/(arr.length/co[s].초월.length))>=cf.colFishPer?' 🎉보상획득가능':''),li[3],
        co[s].초월.map(e=>'['+e+']').join(', '),,
        li[3],'√ 신화등급 ('+co[s].신화.length+'/'+arr.length+') - '+(100/(arr.length/co[s].신화.length)).toFixed(1)+'%'+((100/(arr.length/co[s].신화.length))>=cf.colFishPer?' 🎉보상획득가능':''),li[3],
        co[s].신화.map(e=>'['+e+']').join(', '),,
        li[3],'√ 전설등급 ('+co[s].전설.length+'/'+arr.length+') - '+(100/(arr.length/co[s].전설.length)).toFixed(1)+'%'+((100/(arr.length/co[s].전설.length))>=cf.colFishPer?' 🎉보상획득가능':''),li[3],
        co[s].전설.map(e=>'['+e+']').join(', '),,
        li[3],'√ 희귀등급 ('+co[s].희귀.length+'/'+arr.length+') - '+(100/(arr.length/co[s].희귀.length)).toFixed(1)+'%'+((100/(arr.length/co[s].희귀.length))>=cf.colFishPer?' 🎉보상획득가능':''),li[3],
        co[s].희귀.map(e=>'['+e+']').join(', '),,
        li[3],'√ 일반등급 ('+co[s].일반.length+'/'+arr.length+') - '+(100/(arr.length/co[s].일반.length)).toFixed(1)+'%'+((100/(arr.length/co[s].일반.length))>=cf.colFishPer?' 🎉보상획득가능':''),li[3],
        co[s].일반.map(e=>'['+e+']').join(', '),,
        li[3],'√ 잡템 ('+co[s].잡템.length+'/'+fishs.trash.list.length+') - '+(100/(fishs.trash.list.length/co[s].잡템.length)).toFixed(1)+'%'+((co[s].잡템.length)>=fishs.trash.list.length?' 🎉보상획득가능':''),li[3],
        co[s].잡템.map(e=>'['+e+']').join(', '),,,
        li[3],'⚠️ 물고기도감 보상',li[3],
        Object.keys(cf.collectFish).map(e=>[
            '[ '+e+'등급 보상 ]',
            '• 🧂 합성가루 '+WeightConvert(cf.collectFish[e][0]),
            '• 🧧 행운의부적 '+cf.collectFish[e][1]+'개',
            '• '+NumberString(cf.collectFish[e][2])+'라지',
            '• 🎫 낚싯대뽑기권 '+cf.collectFish[e][3]+'장'
        ].join('\n')).join('\n'+li[2]+'\n')
    ].join('\n'));
    return;
}

/** 물고기도감보상받기 **/
if(cmd.getColFish.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));
    let cmdA = msg.split(' ')[1];  // 입력한 등급
    let classA = ['잡템', '일반', '희귀', '전설', '신화', '초월', '무한'];  // 물고기 등급
    if(!classA.includes(cmdA)){
        replier.reply('• '+Name(me[s])+'님, 등급을 정확하게 입력해 주세요.');
        return;
    }
    let fishs = fish;
    let keys = Object.keys(fishs);
    let arr = [];
    for(let i=0; i<keys.length-1; i++)
        fishs[keys[i]].list.forEach(e=>arr.push(e));
    arr = Array.from(new Set(arr));  // 잡템 제외한 모든 물고기
    if(cmdA == classA[0]){
        if(fishs.trash.list.length > co[s][cmdA].length){
            replier.reply('• '+Name(me[s])+'님의 '+And(cmdA,'은 ','는 ')+(fishs.trash.list.length-co[s][cmdA].length)+'개 부족해요.');
            return;
        }
    } else{
        if(Math.ceil(arr.length*(cf.colFishPer*0.01)) > co[s][cmdA].length){
            replier.reply('• '+Name(me[s])+'님의 '+cmdA+'등급 물고기는 '+((Math.ceil(arr.length*(cf.colFishPer*0.01)))-co[s][cmdA].length)+'마리 부족해요.');
            return;
        }
    }
    co[s][cmdA] = [];  // 해당등급 도감 비우기
    me[s].bag.synthesis += cf.collectFish[cmdA][0];
    me[s].bag.double += cf.collectFish[cmdA][1];
    me[s].gold += cf.collectFish[cmdA][2];
    me[s].bag.rodTicket += cf.collectFish[cmdA][3];
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    FS.write(path+'user/'+s+'/col.json', JSON.stringify(co[s], null, 4));
    replier.reply('• '+Name(me[s])+'님이 '+cmdA+'등급 수집보상으로 🎫낚싯대뽑기권 '+cf.collectFish[cmdA][3]+'장 / 🧂합성가루 '+WeightConvert(cf.collectFish[cmdA][0])+' / 🧧행운의부적 '+cf.collectFish[cmdA][1]+'개 / '+NumberString(cf.collectFish[cmdA][2])+'라지 획득!');
    return;
}


/** 칭호목록 **/
if(cmd.col_rank.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));
    replier.reply([
        '🍀 '+Name(me[s])+'님의 칭호목록'+more,li[3],
        '⚠️ 칭호뽑기비용 : '+Div(cf.popRankPrice)+'포인트',
        '⚠️ 칭호교체비용 : '+Div(cf.changeRankPrice)+'라지',li[2],
        '• '+cmd.popRank[0],
        '• '+cmd.changeRank[0]+' (번호)',,
        li[2],'√ 획득한 칭호',li[2],
        co[s].칭호.map((e,i)=>++i+'. '+e).join('\n')
    ].join('\n'));
    return;
}


/** 기본낚싯대추가 **/
if(cmd.addBasicRod.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].bag.rod.length >= me[s].bag.capacity){
        replier.reply('• '+s+'님의 낚싯대보관함이 가득 찼어요.');
        return;
    }
    me[s].bag.rod.push({
        name : '기본낚싯대',
        class : '무료',
        order : 0,
        success : Number(me[s].rod.success/2),
        time : [Number(me[s].rod.time[0]/2|0), Number(me[s].rod.time[1]/2|0)],
        rest : Number(me[s].rod.rest/2|0),
        hp : Number(me[s].rod.hp/2|0),
        luk : Number(me[s].rod.luk/2|0)
    });
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님에게 기본낚싯대가 지급되었어요.'+more,,
        li[3],'√ 낚싯대 목록',li[3],
        ListRod(me[s])
    ].join['\n']);
    return;
}


/** 이동 **/
if(cmd.move.some(e=>msg.startsWith(e))){
    let data = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(data)) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(data.restOn){
        replier.reply('• '+s+'님은 휴식중이예요.');
        return;
    }
    let place = msg.split(' ')[1];
    if(!map.list.includes(place)){
        replier.reply([
            '🏃🏻 낚시터 이동하기'+more,li[3],
            '※ 명령어 : '+cmd.move[0]+' [낚시터명]',,
            li[2],'√ 낚시터',li[2],
            map.list.map(e=>'• '+e+' --- (Lv.'+fish[e].lv+')').join('\n')
        ].join('\n'));
        return;
    } if(data.map == place){
        replier.reply('• '+s+'님은 이미 '+place+'에 있어요.');
        return;
    } if(data.lv < fish[place].lv){
        replier.reply('• '+And(place,'은','는')+' Lv.'+fish[place].lv+'부터 입장 가능해요.');
        return;
    }
    data.map = place;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(data, null, 4));
    replier.reply('• '+Name(data)+'님이 '+And(place,'으로','로')+' 이동했어요.');
    return;
}


/** 물고기섭취 **/
if(cmd.eatFish.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    }
    let num = Number(msg.split(' ')[1]);
    if(isNaN(num) || !num || num < 1 || num > me[s].box.fish.length+1 || !me[s].box.fish.length) return;
    let eatA = EatFish(me[s]);  // 섭취 성공률
    let fishA = me[s].box.fish.splice(num-1, 1);  // 양동이에서 물고기 빼기
    fishA = fishA[0];
    let result = [];
    if(eatA < Math.random()*100){
        let add = Number(fishA.size / (me[s].lv * 2) | 0);
        if(me[s].hp-add < 0) add = Number(me[s].hp);
        me[s].hp -= add;
        result.push('• '+me[s].rank+' '+me[s].name+'님이 ['+fishA.class+']'+And(fishA.name,'을','를')+' 먹고 배탈이 났어요.');
        if(!!add) result.push('• 체력 '+Div(add)+' 감소.');
    } else{
        let add = Number(fishA.size / (me[s].lv) * fishA.order | 0);
        if(add > (me[s].maxHp+me[s].rod.hp|0)-me[s].hp) add = Number((me[s].maxHp+me[s].rod.hp|0)-me[s].hp);
        me[s].hp += add;
        result.push('• '+Name(me[s])+'님이 ['+fishA.class+']'+And(fishA.name,'을','를')+' 맛있게 먹었어요.');
        if(!!add) result.push('• 체력 '+Div(add)+' 회복.');
    }
    result.push('• 현재체력 : '+Div(me[s].hp)+'/'+Div(me[s].maxHp + me[s].rod.hp | 0));
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply(result.join('\n'));
    return;
}


/** 휴식 **/
if(cmd.rest.includes(msg)){
    let data = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(data)) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } 
    let res = {
        hp : data.maxHp + data.rod.hp | 0,  // 최대체력 계산
        time : (cf.rest + data.rest + data.rod.rest) * 1000  // 휴식시간 계산
    };
    if(!data.restOn){
        if(data.hp == res.hp){
            replier.reply('• '+s+'님은 이미 체력이 가득찼어요.');
            return;
        }
        data.restOn = 1;  // 휴식 시작
        data.restTime = Number(Date.now());  // 휴식 시작시간
        FS.write(path+'user/'+s+'/user.json', JSON.stringify(data, null, 4));
        replier.reply([
            '• '+Name(data)+'님이 휴식을 시작했어요.',
            '• 예상시간 : '+TimeConvert((res.hp - data.hp) * res.time)
        ].join('\n'));
        return;
    }
    data.hp += (Number(Date.now()) - data.restTime) / res.time | 0;
    if(data.hp > res.hp) data.hp = res.hp;
    data.restOn = 0;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(data, null, 4));
    replier.reply([
        '• '+Name(data)+'님이 휴식을 종료했어요.',
        '• 체력 : '+Div(parseInt(data.hp)-1)+'/'+Div(res.hp)
    ].join('\n'));
    return;
}


/** 잠금해제 **/
if(cmd.unlock.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(!me[s].box.lock.length){
        replier.reply('• '+s+'님, 선택 가능한 물고기가 없어요.');
        return;
    }
    let target = msg.split(' ')[1];  // 선택한 물고기 번호
    let fishs = [];
    if(!target) return;
    if(target.includes('-')){
        let tar = [target.split('-')[0], target.split('-')[1]];
        if(tar.some(e=> (isNaN(e) || e<1 || e>me[s].box.lock.length)) || tar[0] == tar[1]){
            replier.reply('• '+s+'님, 올바른 형식이 아니예요.');
            return;
        } tar.sort((a,b)=>a-b);
        fishs = me[s].box.lock.splice(tar[0]-1, tar[1]-tar[0]+1);
        me[s].box.fish = me[s].box.fish.concat(fishs);
    } else{
        if(isNaN(target) || target<1 || target>me[s].box.lock.length){
            replier.reply('• '+s+'님, 올바른 형식이 아니예요.');
            return;
        }
        fishs = me[s].box.lock.splice(Number(target)-1, 1);
        me[s].box.fish.push(fishs[0]);  // 물고기 넣기
    }
    if(me[s].config.autoSort){
        me[s].box.fish.sort((a,b)=>b.order - a.order);  // 등급순으로 정렬
        me[s].box.fish.sort((a,b)=>(b.order==a.order?(b.gold-a.gold):-1));  // 크기별로 정렬
    }
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 물고기 '+fishs.length+'마리를 잠금해제 했어요.'+more,,
        fishs.map(e=>'• ['+e.class+'] '+e.name+' ('+Div(e.size)+'Cm)').join('\n'),,
        Box(me[s],1,1)
    ].join('\n'));
    return;
}

/** 잠금 **/
if(cmd.lock.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(!me[s].box.fish.length){
        replier.reply('• '+s+'님, 선택 가능한 물고기가 없어요.');
        return;
    }
    let target = msg.split(' ')[1];  // 선택한 물고기 번호
    let fishs = [];
    if(!target) return;
    if(target.includes('-')){
        let tar = [target.split('-')[0], target.split('-')[1]];
        if(tar.some(e=> (isNaN(e) || e<1 || e>me[s].box.fish.length)) || tar[0] == tar[1]){
            replier.reply('• '+s+'님, 올바른 형식이 아니예요.');
            return;
        } tar.sort((a,b)=>a-b);
        fishs = me[s].box.fish.splice(tar[0]-1, tar[1]-tar[0]+1);
        me[s].box.lock = me[s].box.lock.concat(fishs);
    } else{
        if(isNaN(target) || target<1 || target>me[s].box.fish.length){
            replier.reply('• '+s+'님, 올바른 형식이 아니예요.');
            return;
        }
        fishs = me[s].box.fish.splice(Number(target)-1, 1);
        me[s].box.lock.push(fishs[0]);  // 물고기 넣기
    } if(me[s].config.autoSort){
        me[s].box.lock.sort((a,b)=>b.order - a.order);  // 등급순으로 정렬
        me[s].box.lock.sort((a,b)=>(b.order==a.order?(b.gold-a.gold):-1));  // 크기별로 정렬
    }
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 물고기 '+fishs.length+'마리를 잠금했어요.'+more,,
        fishs.map(e=>'• ['+e.class+'] '+e.name+' ('+Div(e.size)+'Cm)').join('\n'),,
        Box(me[s],1,1)
    ].join('\n'));
    return;
}


/** 낚싯대 잠금/잠금해제 **/
if(cmd.lockRod.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(!me[s].bag.rod.length){
        replier.reply('• '+s+'님의 가방에 낚싯대가 없어요.');
        return;
    }
    let target = Number(msg.split(' ')[1]);
    if(isNaN(target) || parseInt(target) != target || target < 1 || target > me[s].bag.rod.length){
        replier.reply('• '+s+'님, 낚싯대 선택이 잘못되었어요.');
        return;
    }
    target--;
    let statA = '잠금';
    let rodA = me[s].bag.rod[target];
    if(me[s].bag.rod[target].lock){
        me[s].bag.rod[target].lock = 0;
        statA = '잠금해제';
    } else me[s].bag.rod[target].lock = 1;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님의 '+And(rodA.name,'이','가')+' "'+statA+'" 상태로 전환되었어요.'+more,,
        ListRod(me[s])
    ].join('\n'));
    return;
}


/** 미끼 **/
if(cmd.bait.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    let priceA = Number(me[s].bait.maxNum*cf.baitBuildupCoe);
    replier.reply([
        '🪱 미끼 목록'+more,li[3],
        '☡ 미끼강화시 최대수량 +'+cf.baitIncreaseNum+'개, 능력치 '+cf.baitChanceCoe+'% 증가.',li[2],
        '• '+cmd.baitChange[0]+' (미끼명)',
        '• '+cmd.baitBuildup[0],
        '• '+cmd.baitBuildupCountinue[0],,
        li[2],'√ 미끼목록',li[2],
        baitList.map(e=>[
            '[ '+e+' ]',
            ' • 사용레벨 : Lv.'+parseInt(bait[e]*cf.baitLv),
            ' • 낚시성공률/행운 : +'+bait[e]+'%',
            ' • 개당구매가격 : '+NumberString((bait[e] * 2 + 1) * cf.baitPriceCoe)+'라지'
        ].join('\n')).join('\n'+li[2]+'\n')
    ].join('\n'));
    return;
}

/** 미끼구매 **/
if(cmd.baitBuy.some(e=>msg.startsWith(e))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    }
    let maxA = Number(me[s].bait.maxNum + ((me[s].bait.lv - 1) * cf.baitIncreaseNum));  // 미끼 최대수량 합산
    if(maxA <= me[s].bait.num){
        replier.reply('• '+s+'님의 미끼가 가득 찼어요.');
        return;
    }
    let num = Number(msg.split(' ')[1]);  // 입력한 미끼수량
    let price = Number((bait[me[s].bait.name] * 2 + 1) * cf.baitPriceCoe);  // 개당 미끼 가격
    let needBait = Number(maxA - me[s].bait.num);  // 필요한 미끼수량
    if(me[s].gold < price){
        replier.reply('• '+s+'님은 미끼를 살 돈이 부족해요.');
        return;
    } if(num > needBait || !num) num = needBait;
    if(me[s].gold < price*num) num = Number(me[s].gold / price | 0);
    me[s].bait.num += num;
    me[s].gold -= price * num;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply('• '+Name(me[s])+'님이 '+NumberString(price*num)+'라지를 지불하여 ['+me[s].bait.name+'] '+num+'개를 구매했어요.');
    return;
}

/** 미끼교체 **/
if(cmd.baitChange.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    }
    let bn = msg.split(' ')[1];  // 교체할 미끼명
    if(!baitList.includes(bn)) return;
    if(me[s].lv < parseInt(bait[bn]*cf.baitLv)){
        replier.reply('• '+And(bn,'은','는')+' Lv.'+parseInt(bait[bn]*cf.baitLv)+'부터 사용 가능해요.');
        return;
    } if(bn == me[s].bait.name){
        replier.reply('• '+me[s].name+'님은 현재 '+And(bn,'을','를')+' 착용중이예요.');
        return;
    }
    let priceA = {
        gold : (bait[me[s].bait.name] * 2 + 1) * cf.baitPriceCoe,  // 현재 미끼의 가격
        name : me[s].bait.name,
        num : me[s].bait.num
    };
    let priceB = {
        gold : (bait[bn] * 2 + 1) * cf.baitPriceCoe,  // 구매할 미끼의 가격
        name : bn
    };
    me[s].bait.num = Number(Math.floor((priceA.gold * me[s].bait.num) / priceB.gold));
    me[s].bait.name = bn;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님의 미끼를 '+And(bn,'으로','로')+' 교체했어요.',
        '• 미끼수량이 금액에 맞게 자동조정 되었어요.'+more,,
        '• '+priceA.name+' '+priceA.num+'개  ➡  '+priceB.name+' '+me[s].bait.num+'개'
    ].join('\n'));
    return;
}

/** 미끼강화 **/
if(cmd.baitBuildup.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(!me[s].rebirth.on && me[s].bait.lv >= cf.maxBaitLv){
        replier.reply('• '+s+'님의 미끼레벨이 최대예요.');
        return;
    }
    let priceA = BaitPrice(me[s]);  // 미끼강화비용
    if(me[s].gold < priceA){
        replier.reply('• '+s+'님의 라지가 부족해요.\n• 미끼강화비용 : '+NumberString(priceA)+'라지');
        return;
    }
    me[s].gold -= priceA;  // 비용지불
    me[s].bait.lv++;  // 미끼레벨 증가
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 '+NumberString(priceA)+'라지를 지불하여 미끼를 강화했어요.',
        '• 남은금액 : '+NumberString(me[s].gold)+'라지'+more,,
        '• Lv.'+(me[s].bait.lv-1)+' ➡ Lv.'+me[s].bait.lv,
        '• 모든 미끼의 낚시성공확률, 행운 '+cf.baitChanceCoe+'% 증가.',
        '• 모든 미끼의 최대수량 '+cf.baitIncreaseNum+'개 증가.'
    ].join('\n'));
    return;
}

/** 미끼연속강화 **/
if(cmd.baitBuildupCountinue.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(!me[s].rebirth.on && me[s].bait.lv >= cf.maxBaitLv){
        replier.reply('• '+s+'님의 미끼레벨이 최대예요.');
        return;
    }
    if(me[s].gold < BaitPrice(me[s])){
        replier.reply('• '+s+'님의 라지가 부족해요.\n• 미끼강화비용 : '+NumberString(BaitPrice(me[s]))+'라지');
        return;
    }
    let numA = 0;  // 강화횟수
    let priceSum = 0;  // 비용 합계
    let lved = me[s].bait.lv;  // 강화 전 레벨
    while(me[s].gold > BaitPrice(me[s]) && (!!me[s].rebirth.on || (!me[s].rebirth.on && me[s].bait.lv < cf.maxBaitLv))){
        me[s].gold -= BaitPrice(me[s]);  // 비용지불
        priceSum += BaitPrice(me[s]);
        me[s].bait.lv++;  // 미끼레벨 증가
        numA++;
    }
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 '+NumberString(priceSum)+'라지를 지불하여 미끼를 강화했어요.',
        '• 남은금액 : '+NumberString(me[s].gold)+'라지'+more,,
        '• Lv.'+(lved)+' ➡ Lv.'+me[s].bait.lv,
        '• 모든 미끼의 낚시성공확률, 행운 '+(cf.baitChanceCoe*numA)+'% 증가.',
        '• 모든 미끼의 최대수량 '+(cf.baitIncreaseNum*numA)+'개 증가.'
    ].join('\n'));
    return;
}


/** 물고기판매 **/
if(cmd.fishSell.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(!me[s].box.fish.length){
        replier.reply('• '+s+'님이 판매할 물고기가 없어요.');
        return;
    }
    let bx = [];
    for(let i=0; i<me[s].box.fish.length; i++) bx.push(me[s].box.fish[i]);
    let fgold = 0;
    for(let i=0; i<bx.length; i++) fgold += bx[i].gold;
    let synA = 0;
    for(let i=0; i<bx.length; i++) synA += bx[i].order*2;
    bx.sort((a,b)=>a.gold-b.gold);
    me[s].gold += fgold;
    me[s].bag.synthesis += synA;
    me[s].box.fish = [];
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 물고기를 판매하여 '+NumberString(fgold)+'라지'+(!synA?'를':'와 합성가루 '+WeightConvert(synA)+'을')+' 받았어요.',
        '• 보유금액 : '+NumberString(me[s].gold)+'라지'+
        (!synA?'':'\n• 보유합성가루 : '+WeightConvert(me[s].bag.synthesis))+more,,
        li[2],'√ 판매한 물고기',li[2],
        bx.map(e=>'['+e.class+'] '+e.name+(!e.order?'':'('+Div(e.size)+'Cm)')+' --- '+NumberString(e.gold)+'라지').join('\n')
    ].join('\n'));
    return;
}


/** 물고기정렬 **/
if(cmd.sortFish.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].box.lock.length <= 1 && me[s].box.fish.length <= 1){
        replier.reply('• '+s+'님의 양동이는 정렬할 필요가 없어요.');
        return;
    }
    if(sortFish[s]==undefined) sortFish[s] = 0;
    let word = ['등급(잠금)', '길이(잠금)', '판매값(잠금)', '등급', '길이', '판매값'];
    sortFish[s] = 1;
    replier.reply([
        '[ 물고기 정렬기준 선택 ]',
        word.map((e,i)=>'['+(++i)+'] '+e).join('\n')
    ].join('\n'));
    return;
}
if(sortFish[s]){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    let word = '';
    if(msg == 1){
        if(me[s].box.lock.length <= 1){
            sortFish[s] = 0;
            replier.reply('• '+s+'님의 잠금된 물고기는 1마리 이하예요.');
            return;
        }
        word = '등급(잠금)';
        me[s].box.lock.sort((a,b)=>b.order-a.order);
    } else if(msg == 2){
        if(me[s].box.lock.length <= 1){
            sortFish[s] = 0;
            replier.reply('• '+s+'님의 잠금된 물고기는 1마리 이하예요.');
            return;
        }
        word = '길이(잠금)';
        me[s].box.lock.sort((a,b)=>b.size-a.size);
    } else if(msg == 3){
        if(me[s].box.lock.length <= 1){
            sortFish[s] = 0;
            replier.reply('• '+s+'님의 잠금된 물고기는 1마리 이하예요.');
            return;
        }
        word = '판매값(잠금)';
        me[s].box.lock.sort((a,b)=>(b.gold-a.gold));
    } else if(msg == 4){
        if(me[s].box.fish.length <= 1){
            sortFish[s] = 0;
            replier.reply('• '+s+'님의 판매가능 물고기는 1마리 이하예요.');
            return;
        }
        word = '등급';
        me[s].box.fish.sort((a,b)=>b.order-a.order);
    } else if(msg == 5){
        if(me[s].box.fish.length <= 1){
            sortFish[s] = 0;
            replier.reply('• '+s+'님의 판매가능 물고기는 1마리 이하예요.');
            return;
        }
        word = '길이';
        me[s].box.fish.sort((a,b)=>b.size-a.size);
    } else if(msg == 6){
        if(me[s].box.fish.length <= 1){
            sortFish[s] = 0;
            replier.reply('• '+s+'님의 판매가능 물고기는 1마리 이하예요.');
            return;
        }
        word = '판매값';
        me[s].box.fish.sort((a,b)=>b.gold-a.gold);
    } else{
        sortFish[s] = 0;
        replier.reply('• '+s+'님의 물고기정렬이 취소되었어요.');
        return;
    }
    sortFish[s] = 0;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님의 물고기를 "'+word+'" 기준으로 정렬했어요.'+more,,
        Box(me[s], 1, 1)
    ].join('\n'));
    return;
}



/** 낚싯대뽑기 **/
if(cmd.popRod.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].bag.capacity <= me[s].bag.rod.length){
        replier.reply('• '+s+'님의 가방이 가득찼어요.');
        return;
    }
    let priceA = RodpopPrice(me[s]);  // 낚싯대뽑기 비용
    if(!me[s].bag.rodTicket && me[s].gold < priceA){
        replier.reply('• '+s+'님의 라지가 부족해요.\n• 필요금액 : '+NumberString(priceA)+'라지');
        return;
    }
    co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));
    let rodA = {
        name : rodList[Math.random()*rodList.length|0],
        class : '일반', order : 1, lock : 0
    };  // 뽑은 낚싯대
    let classA = 0;  // 등급결정수치
    let baitA = SumBait(me[s]);  // 미끼수치합계
    let lukA = SumLuk(me[s])  // 행운수치 합계
    lukA += me[s].rodPop * 0.2;  // 행운수치에 뽑은횟수의 20%를 더함
    rodA.success = Rand(cf.popRod.success[0], cf.popRod.success[1])|0;  // 낚시성공률
    rodA.time = [Number(Rand(cf.popRod.time1[0], cf.popRod.time1[1])|0), Number(Rand(cf.popRod.time2[0], cf.popRod.time2[1])|0)];  // 낚시시간
    rodA.rest = Rand(cf.popRod.rest[0], cf.popRod.rest[1])|0;  // 휴식시간
    rodA.hp = Rand(cf.popRod.hp[0], cf.popRod.hp[1])|0;  // 체력
    rodA.luk = Rand(cf.popRod.luk[0], cf.popRod.luk[1])|0;  // 행운
    /* 낚시성공률 */
    let randA = cf.popRod.success[2];  // 초기 랜덤수치
    while(Math.random()*randA < lukA){
        if(rodA.success > cf.popRod.success[1]) classA += cf.popRod.success[4];
        rodA.success += cf.popRod.success[5];
        randA += cf.popRod.success[3];
    } if(rodA.success > cf.rod.maxSuccessRate) rodA.success = cf.rod.maxSuccessRate;
    /* 최소낚시시간 */
    randA = cf.popRod.time1[2];
    while(Math.random()*randA < lukA){
        if(rodA.time[0] < cf.popRod.time1[0]) classA += cf.popRod.time1[4];
        rodA.time[0] += cf.popRod.time1[5];
        randA += cf.popRod.time1[3];
    } if(rodA.time[0] < cf.time[0]*(-1)+cf.rod.maxTime[0]) rodA.time[0] = Number(cf.time[0]*(-1)+cf.rod.maxTime[0]);
    /* 최대낚시시간 */
    randA = cf.popRod.time2[2];
    while(Math.random()*randA < lukA){
        if(rodA.time[1] < cf.popRod.time2[0]) classA += cf.popRod.time2[4];
        rodA.time[1] += cf.popRod.time2[5];
        randA += cf.popRod.time2[3];
    } if(rodA.time[1] < cf.time[1]*(-1)+cf.rod.maxTime[1]) rodA.time[1] = Number(cf.time[1]*(-1)+cf.rod.maxTime[1]);
    //if(rodA.time[0] > rodA.time[1]) rodA.time[1] = rodA.time[0];
    /* 휴식시간 */
    randA = cf.popRod.rest[2];
    while(Math.random()*randA < lukA){
        if(rodA.rest < cf.popRod.rest[0]) classA += cf.popRod.rest[4];
        rodA.rest += cf.popRod.rest[5];
        randA += cf.popRod.rest[3];
    } if(rodA.rest < cf.rest*(-1)+cf.rod.maxRest) rodA.rest = Number(cf.rest*(-1)+cf.rod.maxRest);
    /* 체력 */
    randA = cf.popRod.hp[2];
    while(Math.random()*randA < lukA){
        if(rodA.hp > cf.popRod.hp[1]) classA += cf.popRod.hp[4];
        rodA.hp += cf.popRod.hp[5];
        randA += cf.popRod.hp[3];
    } if(rodA.hp > cf.rod.maxHp) rodA.hp = cf.rod.maxHp;
    /* 행운 */
    randA = cf.popRod.luk[2];
    while(Math.random()*randA < lukA){
        if(rodA.luk > cf.popRod.luk[1]) classA += cf.popRod.luk[4];
        rodA.luk += cf.popRod.luk[5];
        randA += cf.popRod.luk[3];
    } if(rodA.luk > cf.rod.maxLuk) rodA.luk = cf.rod.maxLuk;
    let classB = ((cf.rod.maxSuccessRate - cf.popRod.success[1]) / cf.popRod.success[5] * cf.popRod.success[4]) +
        (((cf.time[0]*(-1)+cf.rod.maxTime[0]) + cf.popRod.time1[1]) / cf.popRod.time1[5] * cf.popRod.time1[4]) +
        (((cf.time[1]*(-1)+cf.rod.maxTime[1]) + cf.popRod.time2[1]) / cf.popRod.time2[5] * cf.popRod.time2[4]) +
        ((cf.rest - cf.popRod.rest[1]) / cf.popRod.rest[5] * cf.popRod.rest[4]) +
        ((cf.rod.maxHp - cf.popRod.hp[1]) / cf.popRod.hp[5] * cf.popRod.hp[4]) +
        ((cf.rod.maxLuk - cf.popRod.luk[1]) / cf.popRod.luk[5] * cf.popRod.luk[4]);
    if(100/(classB/classA) > cf.popRod.class[0]){
        rodA.class = '희귀'; rodA.order = 2;
    } if(100/(classB/classA) > cf.popRod.class[1]){
        rodA.class = '전설'; rodA.order = 3;
    } if(100/(classB/classA) > cf.popRod.class[2]){
        rodA.class = '신화'; rodA.order = 4;
    } if(100/(classB/classA) > cf.popRod.class[3]){
        rodA.class = '초월'; rodA.order = 5;
    } if(100/(classB/classA) > cf.popRod.class[4]){
        rodA.class = '무한'; rodA.order = 6;
    }
    let cu;  // 지불화폐
    let yesPop = 0;  // 뽑기권 사용여부
    if(me[s].bag.rodTicket > 0){
        me[s].bag.rodTicket--;  // 낚싯대뽑기권 차감
        cu = '🎫낚싯대뽑기권을';
        yesPop = 1;
    } else{
        me[s].gold -= priceA;  // 뽑기비용 지불
        cu = NumberString(priceA)+'라지를';
        me[s].rodPop++;  // 뽑기누적횟수 증가
    }
    me[s].bag.rod.push(rodA);  // 낚싯대 획득
    let colA = 0;
    if(!co[s].rod[rodA.class].includes(rodA.name)){
        colA = 1;
        co[s].rod[rodA.class].push(rodA.name);
        co[s].rod[rodA.class].sort();
        FS.write(path+'user/'+s+'/col.json', JSON.stringify(co[s], null, 4));
    } else ;  // 처음 뽑는 낚싯대라면 낚싯대도감에 등록
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 '+cu+' 사용하여 ['+rodA.class+']'+And(rodA.name,'을','를')+(colA?' 처음':'')+' 뽑았어요.',
        (!yesPop?
            ('• 남은금액 : '+NumberString(me[s].gold)+'라지'):
            ('• 남은뽑기권 : '+NumberString(me[s].bag.rodTicket)+'개')
        )+more,,
        li[2],'√ 낚싯대 정보',li[2],
        '• 이름 : '+rodA.name,
        '• 등급 : '+rodA.class+
        (!rodA.success?'':'\n• 낚시성공률 : '+(rodA.success<0?'':'+')+rodA.success.toFixed(1)+'%'+(rodA.success>=cf.rod.maxSuccessRate?' ⍣':''))+
        ((rodA.time.every(e=>!e))?'':'\n• 낚시시간 : [최소 '+(rodA.time[0]<0?'':'+')+TimeConvert(rodA.time[0]*1000)+']'+(rodA.time[0]<=cf.time[0]*(-1)+cf.rod.maxTime[0]?'⍣':'')+', [최대 '+(rodA.time[1]<0?'':'+')+TimeConvert(rodA.time[1]*1000)+']'+(rodA.time[1]<=cf.time[1]*(-1)+cf.rod.maxTime[1]?'⍣':''))+
        (!rodA.rest?'':('\n• 체력회복 : '+(rodA.rest<0?'':'+')+TimeConvert(rodA.rest*1000))+(rodA.rest<=cf.rest*(-1)+cf.rod.maxRest?'⍣':''))+
        (!rodA.hp?'':('\n• 체력 : '+(rodA.hp<0?'':'+')+Div(rodA.hp))+(rodA.hp>=cf.rod.maxHp?'⍣':''))+
        (!rodA.luk?'':('\n• 행운 : '+(rodA.luk<0?'':'+')+Div(rodA.luk))+(rodA.luk>=cf.rod.maxLuk?'⍣':'')),,
        li[3],'√ 낚싯대 목록',li[3],
        ListRod(me[s])
    ].join('\n'));
    if(co[s].rod[rodA.class].length >= rodList.length/100*cf.colRodPer){
        replier.reply('• '+s+'님, ['+rodA.class+'] 등급 낚싯대도감보상을 받을수 있어요.');
    } else;
    co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));
    if(me[s].rodPop == 200 && !co[s].칭호.includes('뽑기ི중독자ॢ')){
        co[s].칭호.push('뽑기ི중독자ॢ');
        FS.write(path+'user/'+s+'/col.json', JSON.stringify(co[s], null, 4));
        replier.reply('• '+s+'님이 새로운 칭호를 획득했어요.');
    } else ;
    return;
}

/** 낚싯대정렬 **/
if(cmd.sortRod.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].bag.rod.length <= 1){
        replier.reply('• '+s+'님의 낚싯대는 '+me[s].bag.rod.length+'개예요.');
        return;
    }
    if(sortRod[s]==undefined) sortRod[s] = 0;
    let word = ['등급', '낚시성공률', '평균낚시시간', '회복시간', '체력', '행운', '잠금'];
    sortRod[s] = 1;
    replier.reply([
        '[ 낚싯대 정렬기준 선택 ]',
        word.map((e,i)=>'['+(++i)+'] '+e).join('\n')
    ].join('\n'));
    return;
}
if(sortRod[s]){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    let word = '';
    if(msg == 5){
        word = '체력';
        me[s].bag.rod.sort((a,b)=>b.hp-a.hp);
    } else if(msg == 2){
        word = '낚시성공률';
        me[s].bag.rod.sort((a,b)=>b.success-a.success);
    } else if(msg == 3){
        word = '평균낚시시간';
        me[s].bag.rod.sort((a,b)=>((a.time[0]+a.time[1])/2)-((b.time[0]+b.time[1])/2));
    } else if(msg == 4){
        word = '회복시간';
        me[s].bag.rod.sort((a,b)=>a.rest-b.rest);
    } else if(msg == 6){
        word = '행운';
        me[s].bag.rod.sort((a,b)=>b.luk-a.luk);
    } else if(msg == 1){
        word = '등급';
        me[s].bag.rod.sort((a,b)=>b.order-a.order);
    } else if(msg == 7){
        word = '잠금';
        me[s].bag.rod.sort((a,b)=>b.lock-a.lock);
    } else{
        sortRod[s] = 0;
        replier.reply('• '+s+'님의 낚싯대정렬이 취소되었어요.');
        return;
    }
    sortRod[s] = 0;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님의 낚싯대를 "'+word+'" 기준으로 정렬했어요.'+more,,
        li[3],'√ 낚싯대 목록',li[3],
        ListRod(me[s])
    ].join('\n'));
    return;
}

/** 낚싯대판매 **/
if(cmd.sellRod.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(!me[s].bag.rod.length){
        replier.reply('• '+s+'님은 판매할 낚싯대가 없어요.');
        return;
    }
    let target = msg.split(' ')[1];  // 판매할 낚싯대 번호
    if(target == '*'){
        let goldA = 0;  // 총 판매대금
        let numA = 0;  // 총 판매수량
        for(let i=me[s].bag.rod.length-1; i>-1; i--){
            if(me[s].bag.rod[i].lock) ;
            else{
                if(me[s].bag.rod[i].name=='기본낚싯대') ;
                else{
                    goldA += cf.popRodPrice;
                    me[s].gold += cf.popRodPrice;
                }
                numA++;
                me[s].bag.rod.splice(i, 1);
            }
        }
        FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
        replier.reply([
            '• '+Name(me[s])+'님이 낚싯대 '+numA+'개를 판매하여 '+Div(goldA)+'라지를 획득했어요.',
            '• 보유금액 : '+NumberString(me[s].gold)+'라지'
        ].join('\n'));
        return;
    }
    if(!target || isNaN(target) || !me[s].bag.rod[target-1]){
        replier.reply('• '+s+'님, 올바른 형식이 아니예요.');
        return;
    } if(me[s].bag.rod[target-1].lock){
        replier.reply('• '+s+'님, 잠금된 낚싯대는 판매할수 없어요.');
        return;
    }
    let rodA = me[s].bag.rod.splice(target-1, 1);  // 낚싯대 판매
    rodA = rodA[0];
    priceA = cf.popRodPrice;
    if(rodA.name=='기본낚싯대') priceA = 0;
    me[s].gold += priceA;  // 기본뽑기비용 획득
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 ['+rodA.class+'] '+And(rodA.name,'을','를')+' 판매하여 '+Div(priceA)+'라지를 획득했어요.',
        '• 보유금액 : '+NumberString(me[s].gold)+'라지'+more,,
        li[3],'√ 낚싯대 목록',li[3],
        ListRod(me[s])
    ].join('\n'));
    return;
}

/** 낚싯대교체 **/
if(cmd.changeRod.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(!me[s].bag.rod.length){
        replier.reply('• '+s+'님은 교체할 낚싯대가 없어요.');
        return;
    }
    let target = msg.split(' ')[1];  // 교체할 낚싯대 번호
    if(!target || isNaN(target) || !me[s].bag.rod[target-1]){
        replier.reply('• '+s+'님, 올바른 형식이 아니예요.');
        return;
    }
    let A = {
        hp : me[s].maxHp + me[s].rod.hp,
        success : SumFishing(me[s]),
        time : (cf.time[0]+me[s].rod.time[0]+cf.time[1]+me[s].rod.time[1])/2*1000|0,
        rest : cf.rest + me[s].rod.rest,
        luk : SumLuk(me[s])
    };  // 낚싯대 교체 전 스탯
    let take = me[s].bag.rod[target-1];  // 가져올 낚싯대
    let give = me[s].rod;  // 넣을 낚싯대
    me[s].bag.rod.push(me[s].rod);
    me[s].rod = me[s].bag.rod.splice(target-1, 1);
    me[s].rod = me[s].rod[0];
    let B = {
        hp : me[s].maxHp + me[s].rod.hp,
        success : SumFishing(me[s]),
        time : (cf.time[0]+me[s].rod.time[0]+cf.time[1]+me[s].rod.time[1])/2*1000|0,
        rest : cf.rest + me[s].rod.rest,
        luk : SumLuk(me[s])
    };  // 낚싯대 교체 후 스탯
    if(me[s].hp > B.hp) me[s].hp = B.hp;  // 체력이 최대체력 이상이라면 보정
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님의 낚싯대가 교체되었어요.'+more,li[3],
        '['+give.class+'] '+give.name+'  ➡  ['+take.class+'] '+take.name,li[3],
        '〔최대체력〕',Div(A.hp|0)+'  ➡  '+Div(B.hp|0)+' --- ('+(B.hp==A.hp?'-':(B.hp-A.hp>0?('↑'+(B.hp-A.hp|0)):('↓'+(A.hp-B.hp|0))))+')',li[3],
        '〔낚시성공률〕',A.success.toFixed(1)+'%  ➡  '+B.success.toFixed(1)+'% --- ('+(B.success==A.success?'-':(B.success-A.success>0?('↑'+(B.success-A.success).toFixed(1)+'%'):('↓'+(A.success-B.success).toFixed(1)+'%')))+')',li[3],
        '〔평균 낚시시간〕',TimeConvert(A.time)+'  ➡  '+TimeConvert(B.time)+' --- ('+(B.time==A.time?'-':(A.time-B.time>0?('↑'+TimeConvert(A.time-B.time)):('↓'+TimeConvert(B.time-A.time))))+')',li[3],
        '〔회복시간〕',A.rest.toFixed(1)+'초  ➡  '+B.rest.toFixed(1)+'초 --- ('+(B.rest==A.rest?'-':(A.rest-B.rest>0?('↑'+(A.rest-B.rest).toFixed(1)+'초'):('↓'+(B.rest-A.rest).toFixed(1)+'초')))+')',li[3],
        '〔행운〕',Div(A.luk|0)+'  ➡  '+Div(B.luk|0)+' --- ('+(B.luk==A.luk?'-':(B.luk-A.luk>0?('↑'+(B.luk-A.luk|0)):('↓'+(A.luk-B.luk|0))))+')',li[3],
        '< 회복시간 :: 휴식중 체력 1 회복에 걸리는 시간 >',,
        li[3],'√ 낚싯대 목록',li[3],
        ListRod(me[s])
    ].join('\n'));
    return;
}

/** 낚싯대이름변경 **/
if(cmd.nameRod.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(!me[s].bag.rodTicket){
        replier.reply('• '+s+'님은 🎫낚싯대뽑기권이 없어요.');
        return;
    }
    let name = msg.substr(cmd.nameRod[0].length+1);  // 변경할 이름
    if(name.length < 2 || !name){
        replier.reply('• '+s+'님, 낚싯대 이름은 2글자 이상이어야 해요.');
        return;
    } if(name.length > 9){
        replier.reply('• '+s+'님, 낚싯대 이름은 10글자 미만이어야 해요.');
        return;
    }
    me[s].bag.rodTicket--;  // 낚싯대뽑기권 차감
    let nameA = me[s].rod.name;  // 변경전 이름
    me[s].rod.name = name;  // 낚싯대 이름 변경
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 🎫낚싯대뽑기권을 사용하여 낚싯대명을 변경했어요.',
        '• 변경전 : '+nameA,
        '• 변경후 : '+me[s].rod.name
    ].join('\n'));
    return;
}


/** 교환 **/
if(cmd.trade.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    }
    let num = Math.trunc(me[s].bag.rodTicket / cf.tTod);
    let select = ['낚싯대뽑기권('+(!num?'부족':(num*cf.tTod))+') ➡ 행운의부적('+num+')'];
    tradeOn[s] = 1;
    replier.reply([
        '[ 교환항목 선택 ]',
        select.map((e,i)=>++i+'. '+e).join('\n')
    ].join('\n'));
    return;
}
if(tradeOn[s]){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(msg == 1){
        if(me[s].bag.rodTicket < cf.tTod){
            tradeOn[s] = 0;
            replier.reply([
                '• '+s+'님의 낚싯대뽑기권이 부족해요.',
                '• 보유수량 : '+Div(me[s].bag.rodTicket)+'개'
            ].join('\n'));
            return;
        }
        let num = Math.trunc(me[s].bag.rodTicket / cf.tTod);  // 행운의부적 획득수량
        me[s].bag.rodTicket -= num*cf.tTod;
        me[s].bag.double += num;
        replier.reply([
            '• '+Name(me[s])+'님의 🎫낚싯대뽑기권 '+Div(num*cf.tTod)+'개를 🧧행운의부적 '+Div(num)+'개로 바꿨어요.',
            '• 🎫낚싯대뽑기권 : '+Div(me[s].bag.rodTicket)+'개',
            '• 🧧행운의부적 : '+Div(me[s].bag.double)+'개'
        ].join('\n'));
    } else{
        tradeOn[s] = 0;
        replier.reply('• '+s+'님, 교환 취소.');
        return;
    }
    tradeOn[s] = 0;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    return;
}


/** 칭호뽑기 **/
if(cmd.popRank.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].point < cf.popRankPrice){
        replier.reply('• '+s+'님, 포인트가 부족해요.\n• 칭호뽑기비용 : '+Div(cf.popRankPrice)+'포인트');
        return;
    }
    co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));
    let rankA = rank.map(e=>e);
    if(!!co[s].칭호.length)
        for(let i=rankA.length-1; i>-1; i--)
            if(co[s].칭호.includes(rankA[i]))
                rankA.splice(i, 1);
    if(!rankA.length){
        replier.reply('• '+s+'님은 모든 칭호를 뽑았어요\n• 보유한 칭호가 초기화 되었습니다\n• "칭호 수집가"를 획득 하셨습니다\n• 특별보상 : +행운50 +최대체력5');
        co[s].칭호 = [];
        co[s].칭호.push("칭호 수집가");
        me[s].rank = "칭호 수집가";
        me[s].maxHp += 5;
        me[s].luk += 50;
        FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
        FS.write(path+'user/'+s+'/col.json', JSON.stringify(co[s], null, 4));
        return;
    }
    rankA = rankA[Math.random()*rankA.length|0];
    me[s].point -= cf.popRankPrice;
    me[s].rank = rankA;
    co[s].칭호.push(rankA);
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    FS.write(path+'user/'+s+'/col.json', JSON.stringify(co[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 '+Div(cf.popRankPrice)+'포인트를 사용하여 ['+rankA+'] 칭호를 뽑았어요.',
        '• 남은포인트 : '+Div(me[s].point|0)
    ].join('\n'));
    return;
}

/** 칭호교체 **/
if(cmd.changeRank.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].gold < cf.changeRankPrice){
        replier.reply('• '+s+'님, 라지가 부족해요.\n• 칭호교체비용 : '+Div(cf.changeRankPrice)+'라지');
        return;
    }
    co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));
    if(!co[s].칭호.length){
        replier.reply('• '+s+'님은 획득한 칭호가 없어요.');
        return;
    }
    let ra = msg.split(' ')[1];  // 교체할 칭호
    if(!ra || isNaN(ra) || ra<1 || ra>co[s].칭호.length || ra != parseInt(ra)){
        replier.reply('• '+s+'님, 올바른 칭호숫자를 입력하세요.');
        return;
    } if(me[s].rank == co[s].칭호[Number(ra)-1]){
        replier.reply('• '+s+'님은 이미 같은 칭호가 적용중이예요.');
        return;
    }
    me[s].gold -= cf.changeRankPrice;
    me[s].rank = co[s].칭호[Number(ra)-1];
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    FS.write(path+'user/'+s+'/col.json', JSON.stringify(co[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 '+Div(cf.changeRankPrice)+'라지를 사용하여 ['+me[s].rank+'] 칭호로 교체했어요.',
        '• 남은금액 : '+NumberString(me[s].gold)+'라지'
    ].join('\n'));
    return;
}


/** 송금 **/
if(cmd.giveMoney.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].lv < cf.minGiveMoney && !me[s].rebirth.on){
        replier.reply('• '+s+'님, Lv.'+cf.minGiveMoney+'부터 사용할 수 있어요.');
        return;
    }
    let ta = msg.substr(cmd.giveMoney[0].length+1);
    let taN = Number(ta.split(' ').length);
    let money = ta.split(' ')[1];
    let target = ta.split(' ')[0];
    if(taN > 2){
        money = ta.split(' ')[taN-1];
        target = ta.split(' '); target.splice(-1, 1);
        target = target.join(' ');
    } if(target[0] == '@') target = target.slice(1);
    let u = JSON.parse(FS.read(path+'user/'+target+'/user.json'));
    if(!u) replier.reply('• '+s+'님, 유저를 찾을 수 없어요.');
    else if(isNaN) replier.reply('• '+s+'님, 금액은 숫자로만 적어야 해요.');
    else if(money < 10) replier.reply('• '+s+'님, 10라지 이상 보낼 수 있어요.');
    else if(me[s].gold < money) replier.reply('• '+s+'님, 보유금액이 모자라요.');
    else if(fishOn[target]) replier.reply('• '+target+'님이 낚시중이예요.');
    else{
        money = Number(money|0);
        me[s].gold -= money;
        u.gold += money;
        FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
        FS.write(path+'user/'+target+'/user.json', JSON.stringify(u, null, 4));
        replier.reply('• '+Name(me[s])+'님이 '+target+'님에게 '+NumberString+'라지를 보냈어요.');
    }
    return;
}


/** 포인트전환 **/
if(cmd.switchMoney.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    }
    let numA = msg.split(' ')[1];
    if(!numA || numA < 1 || isNaN(numA)){
        replier.reply('• '+s+'님, 올바른 형식이 아니예요.');
        return;
    }
    numA = Number(parseInt(numA));
    if(numA > me[s].point){
        replier.reply('• '+s+'님의 포인트가 부족해요.\n• 보유포인트 : '+Div(me[s].point|0));
        return;
    }
    me[s].point -= numA;
    me[s].gold += numA;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님의 '+NumberString(numA)+'포인트를 '+NumberString(numA)+'라지로 전환했어요.',
        '• 남은포인트 : '+Div(me[s].point|0)
    ].join('\n'));
    return;
}


/** 합성 (물고기합성) **/
try{
if(cmd.synthesis.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(!me[s].bag.synthesis){
        replier.reply('• '+s+'님은 🧂합성가루가 없어요.');
        return;
    }
    let fishNum = msg.substr(cmd.synthesis.length+1).split(' ').sort((a,b)=>a-b);  // 물고기 번호 [A, B]
    fishNum[0] = Number(fishNum[0]);
    fishNum[1] = Number(fishNum[1]);
    if(fishNum.some(e=>e==isNaN(e))){
        replier.reply('• '+s+'님, 올바른 물고기 번호를 적어주세요.');
        return;
    } if(fishNum[0] != parseInt(fishNum[0]) || fishNum[1] != parseInt(fishNum[1])){
        replier.reply('• '+s+'님, 올바른 물고기 번호를 적어주세요.');
        return;
    } if(fishNum[0] < 1 || fishNum[1] > me[s].box.fish.length){
        replier.reply('• '+s+'님, 물고기 선택범위를 벗어났어요.');
        return;
    } if(fishNum[0] == fishNum[1]){
        replier.reply('• '+s+'님, 같은 물고기는 합성할수 없어요.');
        return;
    }
    let fishA = [me[s].box.fish.splice([fishNum[1]-1], 1)[0], me[s].box.fish.splice([fishNum[0]-1], 1)[0]];  // 선택한 물고기들 Data
    if(fishA[0].class != fishA[1].class){
        replier.reply('• '+s+'님, 등급이 다른 물고기는 합성할수 없어요.');
        return;
    } if(fishA.every(e=>e.class==cf.synthesis.class[cf.synthesis.class.length-1])){
        replier.reply('• '+s+'님, '+cf.synthesis.class[cf.synthesis.class.length-1]+'등급 물고기는 합성할수 없어요.');
        return;
    }
    let classNum = cf.synthesis.class.indexOf(fishA[0].class);  // 설정값의 위치
    if(me[s].bag.synthesis < cf.synthesis.need[classNum]){
        replier.reply([
            '• '+s+'님, 🧂합성가루가 부족해요.',
            '• 필요량 : '+cf.synthesis.need[classNum]+'mg',
            '• 보유량 : '+NumberString(me[s].bag.synthesis)+'mg'
        ].join('\n'));
        return;
    }
    let fishB;  // 선택된 물고기
    let perA = Math.random()*100;  // 숫자 굴리기
    let result = '• '+s+'님이 물고기합성에 ';  // 성공, 실패 알림
    let bigA = 0;  // 대성공 여부
    me[s].bag.synthesis -= cf.synthesis.need[classNum];  // 합성가루 소모
    if(perA <= cf.synthesis.per[classNum]){
        if(Math.random()*10 <= 1) bigA = 1;
        if(bigA) result += '대';
        result += '성공했어요!';
        fishB = fishA[0];
        fishB.class = cf.synthesis.class[classNum+1];
        fishB.order++;
        fishB.size = Number(parseInt((fishA[0].size + fishA[1].size) * 0.9));
        if(bigA) fishB.size *= 2;
        fishB.gold = Number(parseInt(fishB.size * cf.fish_gold[fishB.class]));
    } else{
        result += '실패했어요.';
        fishA.sort((a,b)=>b.size - a.size);
        fishB = fishA[0];
    }
    me[s].box.fish.unshift(fishB);
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
            result+more,li[3],
            '• ['+cf.synthesis.class[classNum]+']'+fishA[0].name+' + '+'['+cf.synthesis.class[classNum]+']'+fishA[1].name,
            '• 🧂합성가루 '+cf.synthesis.need[classNum]+'mg 소모',li[3],
            '➡ ['+fishB.class+'] '+fishB.name+'('+NumberString(fishB.size,2)+'Cm) 획득',,
            Box(me[s],0,1)
        ].join('\n'));
        return;
}
} catch(error){
    replier.reply([
        '※ 오류발생'+more,
        '• '+error.name,
        '• '+error.message,
        '• '+error.lineNumber
    ].join('\n'));
    return;
}

/** 순위 **/
if(cmd.ranking.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    let target = msg.substr(cmd.ranking[0].length+1);
    let user = UserList(path);
    let list;
    let listA = '';
    let ii;
    //if(s != '방장') user.splice(user.findIndex(e=>e.name=='방장'), 1);
    //if(s != '주인') user.splice(user.findIndex(e=>e.name=='주인'), 1);
    if(s != '도라지') user.splice(user.findIndex(e=>e.name=='도라지'), 1);
    if(target.includes('물고기')){
        user.sort((a,b)=>b.bestFish.order-a.bestFish.order);
        user.sort((a,b)=>b.bestFish.order==a.bestFish.order?(b.bestFish.size-a.bestFish.size):-1);
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 물고기 : '+user[ii].bestFish.name+' ('+Div(user[ii].bestFish.size)+'Cm)'
        ].join('\n');
        list = '☡ 물고기 등급 > 길이 순서\n\n'+
        user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 물고기 : '+e.bestFish.name+' ('+Div(e.bestFish.size)+'Cm)'
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(target.includes('레벨')){
        user.sort((a,b)=>((!b.rebirth.on?b.lv:b.lv+cf.maxLv)*10000000+b.exp)-((!a.rebirth.on?a.lv:a.lv+cf.maxLv)*10000000+a.exp));
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 현재레벨 : Lv.'+user[ii].lv
        ].join('\n');
        list = '☡ 우선순위 : 환생 > 레벨 > 경험치\n\n'+
        user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 현재레벨 : Lv.'+e.lv
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(['라지','돈','자금','보유금'].some(e=>target.includes(e))){
        user.sort((a,b)=>b.gold-a.gold);
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 보유금 : '+NumberString(user[ii].gold)+'라지'
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 보유금 : '+NumberString(e.gold)+'라지'
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(target.includes('체력')){
        user.sort((a,b)=>(b.maxHp+b.rod.hp)-(a.maxHp+a.rod.hp));
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 최대체력 : '+Div(user[ii].maxHp+user[ii].rod.hp|0)
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 최대체력 : '+Div(e.maxHp+e.rod.hp|0)
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(target.includes('포인트')){
        user.sort((a,b)=>b.point-a.point);
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 포인트 : '+NumberString(parseInt(user[ii].point))
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 포인트 : '+NumberString(parseInt(e.point))
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(target.includes('행운')){
        user.sort((a,b)=>SumLuk(b)-SumLuk(a));
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 행운 : '+Div(SumLuk(user[ii])|0)
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 행운 : '+Div(SumLuk(e)|0)
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(['성공률','성공율'].some(e=>target.includes(e))){
        user.sort((a,b)=>SumFishing(b)-SumFishing(a));
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 낚시성공률 : '+SumFishing(user[ii]).toFixed(1)+'%'
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 낚시성공률 : '+SumFishing(e).toFixed(1)+'%'
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(['낚시시간','낚시 시간','시간'].some(e=>target.includes(e))){
        user.sort((a,b)=>((a.rod.time[0]+a.rod.time[1])/2)-((b.rod.time[0]+b.rod.time[1])/2));
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 평균낚시시간 : '+TimeConvert((((cf.time[0]+user[ii].rod.time[0])+(cf.time[1]+user[ii].rod.time[1]))/2|0 ) * 1000)
        ].join('\n');
        list = '☡ 평균 낚시시간 기준\n\n'+
        user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 평균낚시시간 : '+TimeConvert((((cf.time[0]+e.rod.time[0])+(cf.time[1]+e.rod.time[1]))/2|0 ) * 1000)
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(target.includes('낚싯대') && target.includes('뽑')){
        user.sort((a,b)=>b.rodPop-a.rodPop);
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 낚싯대 뽑은 횟수 : '+Div(user[ii].rodPop)+'회'
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 낚싯대 뽑은 횟수 : '+Div(e.rodPop)+'회'
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(target.includes('낚시횟수')){
        user.sort((a,b)=>b.fishing.count-a.fishing.count);
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 총 낚시횟수 : '+Div(user[ii].fishing.count)+'회'
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 총 낚시횟수 : '+Div(e.fishing.count)+'회'
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(target.includes('누적') && target.includes('성공')){
        user.sort((a,b)=>(!b.fishing.count?0:(100/(b.fishing.count/b.fishing.success)))-(!a.fishing.count?0:(100/(a.fishing.count/a.fishing.success))));
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 누적 성공률 : '+(!user[ii].fishing.count?'0':(100/(user[ii].fishing.count/user[ii].fishing.success)).toFixed(1))+'%'
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 누적 성공률 : '+(!e.fishing.count?'0':(100/(e.fishing.count/e.fishing.success)).toFixed(1))+'%'
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(target.includes('성공')){
        user.sort((a,b)=>b.fishing.success-a.fishing.success);
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 낚시 성공횟수 : '+Div(user[ii].fishing.success)+'회'
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 낚시 성공횟수 : '+Div(e.fishing.success)+'회'
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(target.includes('실패')){
        user.sort((a,b)=>b.fishing.fail-a.fishing.fail);
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 낚시 실패횟수 : '+Div(user[ii].fishing.fail)+'회'
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 낚시 실패횟수 : '+Div(e.fishing.fail)+'회'
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(target.includes('뽑기권')){
        user.sort((a,b)=>b.bag.rodTicket-a.bag.rodTicket);
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 🎫 낚싯대뽑기권 : '+Div(user[ii].bag.rodTicket)+'개'
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 🎫 낚싯대뽑기권 : '+Div(e.bag.rodTicket)+'개'
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } else if(target.includes('부적')){
        user.sort((a,b)=>b.bag.double-a.bag.double);
        ii = user.findIndex(e=>e.name==s);
        listA = [
            '『'+(ii+1)+'등』 '+user[ii].rank+' '+user[ii].name,
            ' ┗ 🧧 행운의부적 : '+Div(user[ii].bag.double)+'개',
            ' ┗ 물고기 두마리 낚을 확률 : '+(user[ii].bag.double * cf.doubleFish + me[s].net.lv).toFixed(2)+'%'
        ].join('\n');
        list = user.map((e,i)=>[
            '『'+(++i)+'등』 '+e.rank+' '+e.name,
            ' ┗ 🧧 행운의부적 : '+Div(e.bag.double)+'개',
            ' ┗ 물고기 두마리 낚을 확률 : '+(e.bag.double * cf.doubleFish + me[s].net.lv).toFixed(2)+'%'
        ].join('\n')).slice(0,cf.maxRank).join('\n\n');
    } 
    else return;
    replier.reply([
        '🌈 "'+target+'" 관련 순위'+more,li[3],
        list,,
        li[3],listA,li[3]
    ].join('\n'));
    return;
}


/** 보안코드발급 **/
if(cmd.addCode.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(!Api.canReply(s)){
        replier.reply('•'+s+'님, 저와의 1:1채팅방에 메시지전송 후 다시 시도하세요.');
        return;
    }
    me[s].code = AddCode();
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply(s, me[s].code);
    replier.reply(s, ['[ 보안코드 설명 ]'+more,
        '• 프로필사진을 변경하면 인식이 되지않으며, 본인확인을 위해서 위의 코드가 필요해요.',
        '• 위의 코드를 잃어버리지 않게 잘 보관해 두세요.'
    ].join('\n'));
    replier.reply('@'+s+'\n• 1:1 채팅방에 보안코드가 전송되었어요.');
    return;
}


/** 인증(본인확인) **/
if(cmd.certify.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!me[s]){
        replier.reply('• '+s+'님은 낚시터 회원이 아니예요.');
        return;
    } if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].hash.includes(Hash)){
        replier.reply('• '+s+'님은 인증할 필요가 없어요.');
        return;
    } if(!Api.canReply(s)){
        replier.reply('• '+s+'님, 저를 클릭해서 1:1채팅방에 메시지 전송후 다시 시도해주세요.');
        return;
    }
    certifyOn[s] = 1;
    replier.reply([
        '• '+s+'님, '+cf.codeLength+'자리 보안코드를 입력하세요.',
        '• 힌트 : '+me[s].code.slice(0,3)+'*'.repeat(cf.codeLength-3)
    ].join('\n'));
    return;
}
if(certifyOn[s] && msg.length == cf.codeLength){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    let cd = AddCode();
    if(msg != me[s].code){
        certifyOn[s] = 0;
        replier.reply([
            '• '+s+'님의 보안코드를 확인할수 없어요.',
            '• 보안코드를 모르시면 낚시터주인에게 문의하세요.'
        ].join('\n'));
        return;
    }
    me[s].hash.push(Number(Hash));
    me[s].code = cd;
    certifyOn[s] = 0;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply(s, cd);
    replier.reply([
        '• '+s+'님의 인증이 완료되었어요.',
        '• 사용한 보안코드가 폐기되었어요.',
        '• 1:1 채팅방으로 신규코드가 전송되었어요.'
    ].join('\n'));
    return;
}


/** 내설정 **/
if(cmd.myconfig.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    replier.reply([
        '⚙️ '+Name(me[s])+'님의 설정'+more,li[3],
        '• '+cmd.autosort[0]+'  ---  (토글)',
        '  (낚시완료, 물고기잠금/해제 후 자동정렬 여부)',,
        li[3],'√ 현재 설정',li[3],
        '• 자동정렬 기능 : '+(me[s].config.autoSort?'ON':'OFF')
    ].join('\n'));
    return;
}

/** 설정 : 자동정렬 on/off **/
if(cmd.autosort.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    }
    if(me[s].config.autoSort){
        me[s].config.autoSort = 0;
        replier.reply('• '+Name(me[s])+'님의 자동정렬 기능이 꺼졌어요.');
    } else{
        me[s].config.autoSort = 1;
        replier.reply('• '+Name(me[s])+'님의 자동정렬 기능이 켜졌어요.');
    }
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    return;
}


/** 환생 **/
if(msg == cmd.rebirth){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].lv < cf.rebirthLv){
        replier.reply('• '+s+'님, 환생은 Lv.'+cf.rebirthLv+' 부터 가능해요.');
        return;
    } if(me[s].rebirth.on){
        replier.reply('• '+s+'님은 이미 환생하셨어요.');
        return;
    }
    let select = ['획득골드 200%', '획득경험치 200%', '물고기길이 150%'];
    replier.reply([
        '[ 환생 능력 선택 ]',
        select.map((e,i)=>'['+(++i)+'] '+e).join('\n')+more,,
        li[2],'√ 환생 후 변화내용',li[2],
        '• 레벨, 기본체력 초기화',
        '• 현재 기본행운의 30% 적용',
        '• 가방의 모든 낚싯대 제거',
        '• 착용한 낚싯대 능력치 33% 적용',
        '• 낚싯대 뽑기횟수 초기화',
        '• 기타 스탯, 양동이는 유지',
        '• 미끼강화 제한레벨 증가',
        '• 낚시속도 증가',
        '• 환생 능력 한가지가 영구적용',
        '• 전용칭호 획득',
        '• 영혼석 획득가능',
        '• 상점 이용가능',,
        '※ 환생 후 다시 되돌릴수 없어요.',
        '※ 높은 레벨에서 환생 하는것을 추천해요.'
    ].join('\n'));
    rebirthOn[s] = 1;
    return;
}
if(!!rebirthOn[s]){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));
    reA = '';
    if(msg == 1){
        me[s].rebirth.gold = 1;
        reA = '• 물고기 판매금액 200% 영구적용.';
    } else if(msg == 2){
        me[s].rebirth.exp = 1;
        reA = '• 낚시 경험치 200% 영구적용.';
    } else if(msg == 3){
        me[s].rebirth.size = 1;
        reA = '• 물고기 길이 150% 영구적용.';
    } else{
        replier.reply('• '+s+'님의 환생이 취소되었어요.');
        rebirthOn[s] = 0;
        return;
    }
    co[s].칭호.push('—̳͟͞͞환생ᩚ자ྀ');
    me[s].map = map.list[0];
    me[s].rebirth.on = 1;
    me[s].lv = 1;
    me[s].exp = 0;
    me[s].maxExp = 10;
    me[s].hp = 10;
    me[s].maxHp = 10;
    me[s].luk = Number(me[s].luk / 10 * 3 | 0);
    me[s].bait.name = '파리';
    me[s].rodPop = 0;
    me[s].bag.capacity = 5;
    me[s].bag.rod = [];
    me[s].rod.success = Number((me[s].rod.success/3).toFixed(1));
    me[s].rod.time[0] = Number(me[s].rod.time[0]/3|0);
    me[s].rod.time[1] = Number(me[s].rod.time[1]/3|0);
    me[s].rod.rest = Number(!(me[s].rod.rest/3|0)?1:(me[s].rod.rest/3|0));
    me[s].rod.hp = Number(me[s].rod.hp/3|0);
    me[s].rod.luk = Number(me[s].rod.luk/3|0);
    rebirthOn[s] = 0;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    FS.write(path+'user/'+s+'/col.json', JSON.stringify(co[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 환생했어요.'+more,,
        '• 레벨 1로 변경.',
        '• 기본행운 70% 감소.',
        reA,
        '• 가방의 낚싯대 제거.',
        '• 착용낚싯대 능력치 33% 적용.',
        '• 낚싯대 뽑기횟수 초기화.',
        '• 미끼강화 제한레벨 증가',
        '• 낚시속도 증가',
        '• [—̳͟͞͞환생ᩚ자ྀ] 칭호 획득.',
        '• 영혼석 획득가능.',
        '• 상점 이용가능',
        '• 미끼강화 제한레벨 증가'
    ].join('\n'));
    return;
}


/** 상점 **/
if(cmd.shop.includes(msg)){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(!me[s].rebirth.on){
        replier.reply('• '+s+'님, 환생을 해야 이용할수 있어요.');
        return;
    }
    let shopA = shop.info.map(e=>e);
    if(me[s].rebirth.size) shopA.splice(2, 1);
    if(me[s].rebirth.exp) shopA.splice(1, 1);
    if(me[s].rebirth.gold) shopA.splice(0, 1);
    replier.reply([
        '🏬 '+Name(me[s])+'님의 상점'+more,li[3],
        '• '+cmd.buy[0]+' (아이템명)',,li[3],
        shopA.map(e=>[
            '[ '+e.icon+' '+e.name+' ]',
            '• 가격 : 🔮'+Div(e.price)+'개',
            '• '+e.content+'\n'
        ].join('\n')).join('\n'),li[3],
        '※ 보유영혼석 : '+Div(me[s].bag.soul)+'개',,
        li[3],'√ 라지상자 확률 정보',li[2],
        '• 10억라지 (0.02%)',
        '• 만라지 ~ 백만라지 (5.00%)',
        '• 1,000라지 ~ 5만라지 (10.00%)',
        '• 1,000라지 ~ 만라지 (15.00%)',
        '• 100라지 ~ 1,000라지 (69.98%)'
    ].join('\n'));
    return;
}

if(cmd.buy.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(!me[s].rebirth.on){
        replier.reply('• '+s+'님, 환생을 해야 이용할수 있어요.');
        return;
    }
    let itemA = msg.split(' ')[1];
    if(!shop.list.includes(itemA)){
        replier.reply('• '+s+'님, 아이템명을 정확히 적어주세요.');
        return;
    }
    let temA = shop.info[shop.list.indexOf(itemA)];
    if(me[s].bag.soul < temA.price){
        replier.reply([
            '• '+s+'님의 영혼석이 부족해요.',
            '• 보유영혼석 : '+Div(me[s].bag.soul)+'개'
        ].join('\n'));
        return;
    }
    let result = [Name(me[s])+'님이 🔮영혼석 '+Div(temA.price)+'개로 '+temA.icon+And(temA.name,'을','를')+' 구매했어요.'];
    if(itemA == shop.list[0]){
        if(me[s].rebirth.gold){
            replier.reply('• '+s+'님은 이미 해당능력이 있어요.');
            return;
        }
        me[s].rebirth.gold = 1;
        result.push('"골드 획득량 100% 증가" 능력 획득.');
    } else if(itemA == shop.list[1]){
        if(me[s].rebirth.exp){
            replier.reply('• '+s+'님은 이미 해당능력이 있어요.');
            return;
        }
        me[s].rebirth.exp = 1;
        result.push('"경험치 획득량 100% 증가" 능력 획득.');
    } else if(itemA == shop.list[2]){
        if(me[s].rebirth.size){
            replier.reply('• '+s+'님은 이미 해당능력이 있어요.');
            return;
        }
        me[s].rebirth.size = 1;
        result.push('"물고기 길이 50% 증가" 능력 획득.');
    } else if(itemA == shop.list[3]) me[s].bag.rodTicket++;
    else if(itemA == shop.list[4]) me[s].bag.double++;
    else if(itemA == shop.list[5]){
        let expA = Number(Rand(50, 150) | 0);
        let expB = Number(me[s].maxExp / 100 * expA | 0);
        me[s].exp += expB;
        result.push('경험치 '+expA+'% ('+Div(expB)+') 획득.');
    } else if(itemA == shop.list[6]){
        let seraA = 0;
        let randA = Number(Math.random()*100);
        if(randA <= 0.02){
            seraA = 1000000000;
            result.push('우와! 갓!갓! 초대박이예요!!');
        } else if(randA <= 5.02){
            seraA = Number(Rand(10000, 1000000)|0);
            result.push('우와! 대박이예요!!');
        } else if(randA <= 15.02){
            seraA = Number(Rand(1000, 50000)|0);
            result.push('괜찮은 수익이네요!');
        } else if(randA <= 35.02){
            seraA = Number(Rand(1000, 10000)|0);
            result.push('그럭저럭 괜찮네요!');
        } else seraA = Number(Rand(100, 1000)|0);
        me[s].gold += seraA;
        result.push(NumberString(seraA)+'라지 획득!');
    }
    else return;
    me[s].bag.soul -= temA.price;  // 영혼석 지불
    replier.reply([
        result.map(e=>'• '+e).join('\n'),
        '• 남은 영혼석 : '+Div(me[s].bag.soul)+'개'
    ].join('\n'));
    /* 경험치가 가득차면 레벨업 */
    if(me[s].exp >= me[s].maxExp){
        co[s] = JSON.parse(FS.read(path+'user/'+s+'/col.json'));
        f[s] = {};
        LevelUp(me[s], co[s], f[s]);
        f[s] = null; co[s] = null;
    }
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    return;
}


/** 가방구매 **/
if(cmd.buybag.some(e=>msg.startsWith(e))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    }
    let num = Number(msg.split(' ')[1]);  // 입력한 미끼수량
    let price = 300000;  // 개당 미끼 가격
    //let needBait = Number(maxA - me[s].bait.num);  // 필요한 미끼수량
    if(me[s].gold < price * num){
        replier.reply('• '+s+'님은 가방 '+ num +'개를 살 돈이 부족해요.');
        return;
    } if(me[s].gold < price * num) num = Number(me[s].gold / price | 0);
    me[s].bag.capacity += num;
    me[s].gold -= price * num;
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply('• '+Name(me[s])+'님이 '+NumberString(price*num)+'라지를 지불하여 가방 '+num+'개를 구매했어요.');
    return;
}

  
  /** 칭호이름변경 **/
if(cmd.nameRank.some(e=>msg.startsWith(e+' '))){
    me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
    if(!Check(me[s])) return;
    if(fishOn[s]){
        replier.reply('• '+s+'님은 낚시중이예요.');
        return;
    } if(me[s].gold < 300000){
        replier.reply('• '+s+'님은 칭호변경할 라지가 부족해요');
        return;
    }
    let name = msg.substr(cmd.nameRank[0].length+1);  // 변경할 이름
    if(name.length > 9){
        replier.reply('• '+s+'님, 칭호 이름은 10글자 미만이어야 해요.');
        return;
    }
    let price = 300000;
    me[s].gold -= price;
    let nameA = me[s].rank;  // 변경전 이름
    me[s].rank = name;  // 낚싯대 이름 변경
    FS.write(path+'user/'+s+'/user.json', JSON.stringify(me[s], null, 4));
    replier.reply([
        '• '+Name(me[s])+'님이 '+NumberString(price)+'라지를 지불하여 칭호 '+me[s].rank+'으로 변경했어요.',
        '• 변경전 : '+nameA,
        '• 변경후 : '+me[s].rank
    ].join('\n'));
    return;
} 

  /****/
   if (msg == '그물강화'){
   me[s] = JSON.parse(FS.read(path+'user/'+s+'/user.json'));
   if(!Check(me[s])) return;
   if (me[s].net === undefined){ // 그물 데이터가 없을시 추가
      me[s].net = {};
      me[s].net.name = "그물";
      me[s].net.lv = 0;
      me[s].net.fail = 0;
      //me[s].net.success = 0;
      me[s].net.total = 0;
      FS.write(path + 'user/' + s + '/user.json', JSON.stringify(me[s], null, 4));
      replier.reply("그물 데이터가 생성되었습니다 다시 시도해주세요");
    }
   let price = Math.pow(me[s].bait.lv*me[s].net.lv,2)
   if (me[s].gold < price){
	   replier.reply("강화에 사용할 라지가 부족합니다.\n강화비용 : " + price );
	   return;
   }
   me[s].gold -= price;
   me[s].net.total += price;
   FS.write(path + 'user/' + s + '/user.json', JSON.stringify(me[s], null, 4));
   if (probability(100-Math.pow(me[s].net.lv, 2)+me[s].net.fail) == true){
      me[s].net.lv += 1;
      FS.write(path + 'user/' + s + '/user.json', JSON.stringify(me[s], null, 4));
      replier.reply([
         '• '+Name(me[s])+'님이 그물 강화에 성공 하셨습니다.'+more,,
         '〔그물〕: ' +me[s].net.name,
         '〔레벨〕: ' + me[s].net.lv,   
         //'〔강화 성공률〕: ' + 100-Math.pow(me[s].net.lv, 2)+me[s].net.fail,
         //'〔시도 횟수〕: ' + me[s].net.success,
         '〔실패 횟수〕: ' + me[s].net.fail,
         '〔강화에 꼬라박은 라지〕: ' + me[s].net.total
    ].join('\n'));      
   return;
    } else{
      me[s].net.fail++;
      FS.write(path + 'user/' + s + '/user.json', JSON.stringify(me[s], null, 4));
      replier.reply([
         '• '+Name(me[s])+'님이 그물 강화에 실패 하셨습니다.'+more,,
         '〔그물〕: '+ me[s].net.name,
         '〔레벨〕: ' + me[s].net.lv,   
         //'〔강화 성공률〕: ' + 100-Math.pow(me[s].net.lv, 2)+me[s].net.fail,
         //'〔시도 횟수〕: ' + me[s].net.success,
         '〔실패 횟수〕: ' + me[s].net.fail,
         '〔강화에 꼬라박은 라지〕: ' + me[s].net.total
    ].join('\n'));
      if (probability(me[s].net.lv) == true && probability(me[s].net.lv) == true){
         me[s].net.lv = 0;
		 me[s].gold += me[s].net.total/10;
		 FS.write(path + 'user/' + s + '/user.json', JSON.stringify(me[s], null, 4));
         replier.reply([
            '• '+Name(me[s])+'님이 그물 강화에 실패 하여 그물레벨이 0으로 하락하였습니다.'+more,,
            '〔초기화 위로금〕' + me[s].net.total/10 + ' 라지를 지급하였습니다'
         ].join('\n'));
      return;
      }
      if (probability(me[s].net.lv) == true){
         me[s].net.lv -= 1;
		 FS.write(path + 'user/' + s + '/user.json', JSON.stringify(me[s], null, 4));
         replier.reply([
            '• '+Name(me[s])+'님이 그물 강화에 실패 하여 그물레벨이 1 하락하였습니다.'+more
         ].join('\n'));
      return;
      }      
    }
  }
}
