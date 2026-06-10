import { useState, useEffect, useCallback } from "react";

const TG  = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const DZ  = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const TG_WX = {甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
const TG_YY = {甲:"陽",乙:"陰",丙:"陽",丁:"陰",戊:"陽",己:"陰",庚:"陽",辛:"陰",壬:"陽",癸:"陰"};
const WX_C  = {木:"#4A8060",火:"#A85438",土:"#7A6040",金:"#707840",水:"#3A6878"};
const WX_LT = {木:"#EBF3EE",火:"#F6EAE4",土:"#F2EBE0",金:"#F0F0DC",水:"#E0EEF5"};
const CANG  = {子:["壬"],丑:["己","癸","辛"],寅:["甲","丙","戊"],卯:["乙"],辰:["戊","乙","癸"],巳:["丙","庚","戊"],午:["丁","己"],未:["己","丁","乙"],申:["庚","壬","戊"],酉:["辛"],戌:["戊","辛","丁"],亥:["壬","甲"]};
const POS = ["年柱","月柱","日柱","時柱"];
const POS_REL = {年:"長輩/祖先",月:"父母/兄弟",日:"自己/配偶",時:"子女/晚輩"};

// 地支三類
const DZ_MA  = new Set(["寅","巳","申","亥"]);
const DZ_HUA = new Set(["子","午","卯","酉"]);
const DZ_KU  = new Set(["辰","戌","丑","未"]);

// 身強月支對照
const SQ_MAP = {
  木:new Set(["寅","卯","辰","亥","子","丑"]),
  火:new Set(["巳","午","未","寅","卯","辰"]),
  土:new Set(["巳","午","未"]),
  金:new Set(["申","酉","戌","巳","午","未"]),
  水:new Set(["亥","子","丑","申","酉","戌"]),
};

// 衝合害刑
const CHONG = [["子","午"],["丑","未"],["寅","申"],["卯","酉"],["辰","戌"],["巳","亥"]];
const LIU_HE= [["子","丑","土"],["寅","亥","木"],["卯","戌","火"],["辰","酉","金"],["巳","申","水"],["午","未","土"]];
const SAN_HE= [["申","子","辰","水"],["寅","午","戌","火"],["亥","卯","未","木"],["巳","酉","丑","金"]];
const HAI   = [["子","未"],["丑","午"],["寅","巳"],["卯","辰"],["申","亥"],["酉","戌"]];
const XING_3= [{m:["寅","巳","申"],t:"無恩之刑"},{m:["丑","戌","未"],t:"持勢之刑"}];
const XING_2= [{m:["子","卯"],t:"無禮之刑"}];
const SELF_X= ["辰","午","酉","亥"];

// 節氣DB（1980-2030）
const JQ_DB = {
  1980:{立春:[2,5,10,10],驚蟄:[3,5,4,2],清明:[4,4,8,46],立夏:[5,5,20,56],芒種:[6,6,13,7],小暑:[7,7,23,21],立秋:[8,7,1,9],白露:[9,7,5,5],寒露:[10,7,20,41],立冬:[11,7,22,58],大雪:[12,7,15,55],小寒:[1,6,3,17]},
  1981:{立春:[2,4,15,56],驚蟄:[3,5,9,52],清明:[4,4,14,38],立夏:[5,5,2,52],芒種:[6,5,19,5],小暑:[7,7,5,23],立秋:[8,7,7,14],白露:[9,7,11,10],寒露:[10,8,2,46],立冬:[11,7,5,6],大雪:[12,6,21,57],小寒:[1,5,9,15]},
  1982:{立春:[2,4,21,46],驚蟄:[3,5,15,44],清明:[4,4,20,31],立夏:[5,5,8,44],芒種:[6,5,1,0],小暑:[7,7,11,15],立秋:[8,7,13,4],白露:[9,7,17,0],寒露:[10,8,8,35],立冬:[11,7,10,54],大雪:[12,7,3,43],小寒:[1,5,14,57]},
  1983:{立春:[2,4,3,36],驚蟄:[3,5,21,38],清明:[4,5,2,22],立夏:[5,5,14,34],芒種:[6,5,6,47],小暑:[7,7,17,4],立秋:[8,7,18,53],白露:[9,7,22,47],寒露:[10,8,14,22],立冬:[11,7,16,39],大雪:[12,7,9,27],小寒:[1,6,20,43]},
  1984:{立春:[2,4,9,20],驚蟄:[3,5,3,12],清明:[4,4,8,1],立夏:[5,5,20,15],芒種:[6,5,12,30],小暑:[7,6,22,49],立秋:[8,7,0,37],白露:[9,7,4,34],寒露:[10,7,20,9],立冬:[11,6,22,25],大雪:[12,6,15,11],小寒:[1,6,2,28]},
  1985:{立春:[2,4,15,12],驚蟄:[3,5,9,6],清明:[4,4,13,58],立夏:[5,5,2,16],芒種:[6,5,18,34],小暑:[7,7,4,55],立秋:[8,7,6,44],白露:[9,7,10,39],寒露:[10,8,2,15],立冬:[11,7,4,29],大雪:[12,6,21,15],小寒:[1,6,8,31]},
  1986:{立春:[2,4,21,8],驚蟄:[3,5,15,3],清明:[4,4,19,56],立夏:[5,5,8,11],芒種:[6,5,0,26],小暑:[7,7,10,47],立秋:[8,7,12,35],白露:[9,7,16,32],寒露:[10,8,8,5],立冬:[11,7,10,19],大雪:[12,7,3,2],小寒:[1,5,14,12]},
  1987:{立春:[2,4,3,2],驚蟄:[3,5,20,58],清明:[4,5,1,51],立夏:[5,5,14,9],芒種:[6,5,6,23],小暑:[7,7,16,47],立秋:[8,7,18,37],白露:[9,7,22,35],寒露:[10,8,14,10],立冬:[11,7,16,26],大雪:[12,7,9,13],小寒:[1,6,20,26]},
  1988:{立春:[2,4,8,44],驚蟄:[3,5,2,37],清明:[4,4,7,25],立夏:[5,4,19,41],芒種:[6,5,11,57],小暑:[7,6,22,19],立秋:[8,7,0,9],白露:[9,7,4,8],寒露:[10,7,19,47],立冬:[11,6,22,5],大雪:[12,6,14,56],小寒:[1,6,2,9]},
  1989:{立春:[2,4,14,27],驚蟄:[3,5,8,28],清明:[4,4,13,22],立夏:[5,5,1,42],芒種:[6,5,17,58],小暑:[7,7,4,20],立秋:[8,7,6,9],白露:[9,7,10,9],寒露:[10,8,1,47],立冬:[11,7,4,4],大雪:[12,6,20,48],小寒:[1,6,7,59]},
  1990:{立春:[2,4,20,15],驚蟄:[3,5,14,14],清明:[4,4,19,4],立夏:[5,5,7,17],芒種:[6,5,23,33],小暑:[7,7,9,54],立秋:[8,7,11,42],白露:[9,7,15,40],寒露:[10,8,7,14],立冬:[11,7,9,30],大雪:[12,7,2,17],小寒:[1,5,13,30]},
  1991:{立春:[2,4,17,8],驚蟄:[3,6,11,4],清明:[4,5,15,48],立夏:[5,6,3,55],芒種:[6,6,20,1],小暑:[7,7,6,13],立秋:[8,8,8,6],白露:[9,8,12,11],寒露:[10,9,4,0],立冬:[11,8,6,16],大雪:[12,7,23,9],小寒:[1,6,5,35]},
  1992:{立春:[2,4,23,48],驚蟄:[3,5,17,46],清明:[4,4,22,27],立夏:[5,5,10,37],芒種:[6,5,2,43],小暑:[7,7,12,55],立秋:[8,7,14,45],白露:[9,7,18,47],寒露:[10,8,9,36],立冬:[11,7,11,55],大雪:[12,7,4,43],小寒:[1,5,16,3]},
  1993:{立春:[2,4,5,38],驚蟄:[3,5,23,33],清明:[4,5,4,13],立夏:[5,5,16,22],芒種:[6,6,8,30],小暑:[7,7,18,44],立秋:[8,7,20,33],白露:[9,7,0,35],寒露:[10,8,16,23],立冬:[11,7,18,37],大雪:[12,7,11,26],小寒:[1,5,22,8]},
  1994:{立春:[2,4,11,31],驚蟄:[3,6,5,31],清明:[4,5,10,15],立夏:[5,5,22,23],芒種:[6,6,14,31],小暑:[7,7,0,44],立秋:[8,8,2,33],白露:[9,8,6,32],寒露:[10,8,22,6],立冬:[11,7,0,21],大雪:[12,7,17,6],小寒:[1,6,3,20]},
  1995:{立春:[2,4,17,13],驚蟄:[3,6,11,14],清明:[4,5,16,1],立夏:[5,6,4,13],芒種:[6,6,20,21],小暑:[7,7,6,35],立秋:[8,8,8,22],白露:[9,8,12,16],寒露:[10,8,3,48],立冬:[11,8,6,1],大雪:[12,7,22,49],小寒:[1,6,9,5]},
  1996:{立春:[2,4,22,8],驚蟄:[3,5,16,0],清明:[4,4,20,53],立夏:[5,5,9,6],芒種:[6,5,1,19],小暑:[7,6,11,35],立秋:[8,7,13,22],白露:[9,7,17,18],寒露:[10,8,8,52],立冬:[11,7,11,5],大雪:[12,6,23,50],小寒:[1,5,10,5]},
  1997:{立春:[2,4,4,4],驚蟄:[3,5,21,58],清明:[4,5,2,46],立夏:[5,5,14,56],芒種:[6,5,7,4],小暑:[7,6,17,16],立秋:[8,7,19,5],白露:[9,7,23,3],寒露:[10,8,14,39],立冬:[11,7,16,52],大雪:[12,7,9,38],小寒:[1,5,19,55]},
  1998:{立春:[2,4,9,57],驚蟄:[3,6,3,54],清明:[4,5,8,45],立夏:[5,5,20,57],芒種:[6,6,13,6],小暑:[7,7,23,18],立秋:[8,8,1,7],白露:[9,8,5,7],寒露:[10,8,20,44],立冬:[11,7,22,59],大雪:[12,7,15,44],小寒:[1,6,2,1]},
  1999:{立春:[2,4,15,57],驚蟄:[3,6,9,58],清明:[4,5,14,46],立夏:[5,6,2,52],芒種:[6,6,18,59],小暑:[7,7,5,9],立秋:[8,8,6,57],白露:[9,8,10,52],寒露:[10,8,2,24],立冬:[11,8,4,39],大雪:[12,7,21,22],小寒:[1,6,7,42]},
  2000:{立春:[2,4,21,32],驚蟄:[3,5,15,30],清明:[4,4,20,17],立夏:[5,5,8,24],芒種:[6,5,0,30],小暑:[7,6,10,42],立秋:[8,7,12,31],白露:[9,7,16,30],寒露:[10,8,8,9],立冬:[11,7,10,28],大雪:[12,7,3,18],小寒:[1,5,13,30]},
  2001:{立春:[2,4,3,28],驚蟄:[3,5,21,28],清明:[4,5,2,14],立夏:[5,5,14,24],芒種:[6,5,6,31],小暑:[7,7,16,41],立秋:[8,7,18,30],白露:[9,7,22,27],寒露:[10,8,14,2],立冬:[11,7,16,17],大雪:[12,7,9,3],小寒:[1,5,19,17]},
  2002:{立春:[2,4,9,23],驚蟄:[3,6,3,22],清明:[4,5,8,11],立夏:[5,5,20,21],芒種:[6,6,12,28],小暑:[7,7,22,38],立秋:[8,8,0,27],白露:[9,8,4,22],寒露:[10,8,19,55],立冬:[11,7,22,12],大雪:[12,7,14,56],小寒:[1,6,1,12]},
  2003:{立春:[2,4,15,5],驚蟄:[3,6,9,0],清明:[4,5,13,52],立夏:[5,6,2,2],芒種:[6,6,18,10],小暑:[7,7,4,19],立秋:[8,8,6,8],白露:[9,8,10,7],寒露:[10,8,1,42],立冬:[11,7,3,54],大雪:[12,7,20,39],小寒:[1,6,6,55]},
  2004:{立春:[2,4,20,56],驚蟄:[3,5,14,56],清明:[4,4,19,43],立夏:[5,5,7,48],芒種:[6,5,23,57],小暑:[7,6,10,8],立秋:[8,7,11,59],白露:[9,7,16,0],寒露:[10,8,7,38],立冬:[11,7,9,59],大雪:[12,7,2,50],小寒:[1,5,13,4]},
  2005:{立春:[2,4,2,43],驚蟄:[3,5,20,45],清明:[4,5,1,37],立夏:[5,5,13,52],芒種:[6,5,6,3],小暑:[7,7,16,16],立秋:[8,7,17,53],白露:[9,7,21,11],寒露:[10,8,13,41],立冬:[11,7,14,59],大雪:[12,7,7,31],小寒:[1,5,18,48]},
  2006:{立春:[2,4,8,26],驚蟄:[3,6,2,28],清明:[4,5,7,14],立夏:[5,5,19,26],芒種:[6,6,11,36],小暑:[7,7,21,47],立秋:[8,7,23,33],白露:[9,8,3,27],寒露:[10,8,19,0],立冬:[11,7,21,13],大雪:[12,7,14,0],小寒:[1,6,1,9]},
  2007:{立春:[2,4,14,18],驚蟄:[3,6,8,20],清明:[4,5,13,4],立夏:[5,6,1,9],芒種:[6,6,17,13],小暑:[7,7,3,23],立秋:[8,8,5,11],白露:[9,8,9,8],寒露:[10,9,0,44],立冬:[11,8,3,0],大雪:[12,7,19,49],小寒:[1,6,6,49]},
  2008:{立春:[2,4,20,0],驚蟄:[3,5,13,59],清明:[4,4,18,47],立夏:[5,5,7,2],芒種:[6,5,23,13],小暑:[7,6,9,27],立秋:[8,7,11,10],白露:[9,7,15,4],寒露:[10,8,6,42],立冬:[11,7,8,57],大雪:[12,7,1,45],小寒:[1,5,11,58]},
  2009:{立春:[2,4,1,50],驚蟄:[3,5,19,49],清明:[4,4,0,33],立夏:[5,5,12,51],芒種:[6,5,5,2],小暑:[7,7,15,15],立秋:[8,7,17,4],白露:[9,7,20,58],寒露:[10,8,12,34],立冬:[11,7,14,48],大雪:[12,7,7,33],小寒:[1,5,17,43]},
  2010:{立春:[2,4,7,47],驚蟄:[3,6,1,47],清明:[4,5,6,30],立夏:[5,5,18,43],芒種:[6,6,10,50],小暑:[7,7,21,2],立秋:[8,7,22,50],白露:[9,8,2,44],寒露:[10,8,18,22],立冬:[11,7,20,36],大雪:[12,7,13,21],小寒:[1,5,23,33]},
  2011:{立春:[2,4,13,32],驚蟄:[3,6,7,30],清明:[4,5,12,12],立夏:[5,5,0,22],芒種:[6,5,16,27],小暑:[7,7,2,41],立秋:[8,7,4,30],白露:[9,8,8,26],寒露:[10,8,0,6],立冬:[11,8,2,24],大雪:[12,7,19,11],小寒:[1,6,5,23]},
  2012:{立春:[2,4,19,22],驚蟄:[3,5,13,21],清明:[4,4,18,5],立夏:[5,5,6,20],芒種:[6,5,22,26],小暑:[7,7,8,40],立秋:[8,7,10,29],白露:[9,7,14,29],寒露:[10,8,6,12],立冬:[11,7,8,25],大雪:[12,7,1,12],小寒:[1,5,11,16]},
  2013:{立春:[2,4,1,13],驚蟄:[3,5,19,14],清明:[4,4,23,56],立夏:[5,5,12,6],芒種:[6,5,4,12],小暑:[7,7,14,24],立秋:[8,7,16,20],白露:[9,7,20,16],寒露:[10,8,11,59],立冬:[11,7,14,14],大雪:[12,7,7,0],小寒:[1,5,17,14]},
  2014:{立春:[2,4,6,59],驚蟄:[3,6,1,2],清明:[4,5,5,47],立夏:[5,5,17,59],芒種:[6,6,10,3],小暑:[7,7,20,15],立秋:[8,7,22,2],白露:[9,8,1,56],寒露:[10,8,17,38],立冬:[11,7,19,53],大雪:[12,7,12,38],小寒:[1,5,22,50]},
  2015:{立春:[2,4,12,58],驚蟄:[3,6,6,56],清明:[4,5,11,39],立夏:[5,5,23,53],芒種:[6,6,15,58],小暑:[7,7,2,12],立秋:[8,8,3,1],白露:[9,8,7,0],寒露:[10,8,22,43],立冬:[11,8,1,0],大雪:[12,7,17,48],小寒:[1,6,4,8]},
  2016:{立春:[2,4,18,46],驚蟄:[3,5,12,43],清明:[4,4,17,27],立夏:[5,5,5,41],芒種:[6,5,21,49],小暑:[7,7,8,3],立秋:[8,7,9,52],白露:[9,7,13,52],寒露:[10,8,5,33],立冬:[11,7,7,47],大雪:[12,7,0,41],小寒:[1,5,11,7]},
  2017:{立春:[2,3,23,34],驚蟄:[3,5,17,32],清明:[4,4,22,17],立夏:[5,5,10,31],芒種:[6,5,2,37],小暑:[7,6,12,51],立秋:[8,7,14,39],白露:[9,7,18,38],寒露:[10,8,10,22],立冬:[11,7,12,37],大雪:[12,7,5,32],小寒:[1,5,17,0]},
  2018:{立春:[2,4,5,28],驚蟄:[3,6,0,28],清明:[4,5,5,13],立夏:[5,5,17,25],芒種:[6,6,10,29],小暑:[7,7,20,41],立秋:[8,7,22,31],白露:[9,8,2,30],寒露:[10,8,18,15],立冬:[11,7,20,32],大雪:[12,7,13,26],小寒:[1,5,22,49]},
  2019:{立春:[2,4,11,14],驚蟄:[3,6,5,10],清明:[4,5,9,51],立夏:[5,5,22,3],芒種:[6,6,15,7],小暑:[7,7,1,21],立秋:[8,8,3,13],白露:[9,8,7,17],寒露:[10,8,22,6],立冬:[11,8,1,24],大雪:[12,7,18,18],小寒:[1,5,23,39]},
  2020:{立春:[2,4,17,3],驚蟄:[3,5,11,57],清明:[4,4,16,38],立夏:[5,5,4,51],芒種:[6,5,20,58],小暑:[7,7,7,14],立秋:[8,7,13,6],白露:[9,7,13,8],寒露:[10,8,4,55],立冬:[11,7,7,14],大雪:[12,7,0,9],小寒:[1,6,11,17]},
  2021:{立春:[2,3,22,59],驚蟄:[3,5,17,53],清明:[4,4,22,35],立夏:[5,5,10,47],芒種:[6,5,2,52],小暑:[7,7,13,5],立秋:[8,7,18,54],白露:[9,7,18,53],寒露:[10,8,10,39],立冬:[11,7,13,0],大雪:[12,7,5,57],小寒:[1,5,17,23]},
  2022:{立春:[2,4,4,51],驚蟄:[3,5,23,44],清明:[4,5,4,20],立夏:[5,5,16,26],芒種:[6,6,8,26],小暑:[7,7,18,38],立秋:[8,7,20,29],白露:[9,8,0,32],寒露:[10,8,16,22],立冬:[11,7,18,45],大雪:[12,7,11,46],小寒:[1,5,23,14]},
  2023:{立春:[2,4,10,43],驚蟄:[3,6,5,36],清明:[4,5,10,13],立夏:[5,5,22,19],芒種:[6,6,14,18],小暑:[7,7,0,31],立秋:[8,8,2,23],白露:[9,8,6,27],寒露:[10,8,22,15],立冬:[11,8,0,36],大雪:[12,7,17,33],小寒:[1,6,5,17]},
  2024:{立春:[2,4,16,27],驚蟄:[3,5,11,23],清明:[4,4,16,2],立夏:[5,5,4,10],芒種:[6,5,20,10],小暑:[7,6,6,20],立秋:[8,7,8,9],白露:[9,7,12,11],寒露:[10,8,3,59],立冬:[11,7,6,20],大雪:[12,6,23,17],小寒:[1,5,11,33]},
  2025:{立春:[2,3,22,10],驚蟄:[3,5,17,7],清明:[4,4,21,48],立夏:[5,5,9,57],芒種:[6,5,2,0],小暑:[7,7,12,5],立秋:[8,7,13,51],白露:[9,7,17,51],寒露:[10,8,9,41],立冬:[11,7,12,3],大雪:[12,7,5,4],小寒:[1,5,17,0]},
  2026:{立春:[2,4,4,1],驚蟄:[3,5,22,58],清明:[4,5,3,40],立夏:[5,5,15,48],芒種:[6,6,7,49],小暑:[7,7,18,1],立秋:[8,7,19,50],白露:[9,7,23,51],寒露:[10,8,15,40],立冬:[11,7,17,59],大雪:[12,7,10,57],小寒:[1,5,22,23]},
  2027:{立春:[2,3,9,46],驚蟄:[3,5,4,37],清明:[4,4,9,17],立夏:[5,4,21,24],芒種:[6,5,13,26],小暑:[7,6,23,37],立秋:[8,7,1,27],白露:[9,7,5,28],寒露:[10,7,21,14],立冬:[11,6,23,33],大雪:[12,6,16,33],小寒:[1,5,4,10]},
  2028:{立春:[2,4,15,31],驚蟄:[3,5,10,25],清明:[4,4,15,9],立夏:[5,5,3,10],芒種:[6,5,19,10],小暑:[7,6,5,22],立秋:[8,7,7,16],白露:[9,7,11,18],寒露:[10,8,3,5],立冬:[11,7,5,26],大雪:[12,6,22,20],小寒:[1,6,9,49]},
  2029:{立春:[2,3,21,12],驚蟄:[3,5,16,11],清明:[4,4,20,58],立夏:[5,5,9,11],芒種:[6,5,1,21],小暑:[7,6,11,35],立秋:[8,7,13,22],白露:[9,7,17,12],寒露:[10,8,8,42],立冬:[11,7,10,57],大雪:[12,7,3,43],小寒:[1,5,14,58]},
  2030:{立春:[2,4,3,8],驚蟄:[3,5,22,9],清明:[4,5,2,58],立夏:[5,5,15,15],芒種:[6,6,7,30],小暑:[7,7,17,43],立秋:[8,7,19,31],白露:[9,7,23,23],寒露:[10,8,14,56],立冬:[11,7,17,12],大雪:[12,7,10,2],小寒:[1,5,20,19]},
};
const MJQ=["小寒","立春","驚蟄","清明","立夏","芒種","小暑","立秋","白露","寒露","立冬","大雪"];
const MZI=[1,2,3,4,5,6,7,8,9,10,11,0];
function jqDate(y,n){const d=JQ_DB[y]?.[n];return d?new Date(y,d[0]-1,d[1],d[2],d[3],0):null;}

// 農曆月聖誕吉日（農曆）
const SACRED={
  1:[{n:"玉皇大帝聖誕",d:9},{n:"天官大帝聖誕",d:15}],
  2:[{n:"土地公聖誕",d:2},{n:"文昌帝君聖誕",d:3},{n:"天上聖母媽祖聖誕",d:23}],
  3:[{n:"玄天上帝聖誕",d:3},{n:"觀世音菩薩聖誕",d:19}],
  4:[{n:"關聖帝君聖誕",d:24},{n:"神農大帝聖誕",d:26}],
  5:[{n:"城隍爺聖誕",d:11}],
  6:[{n:"關聖帝君飛昇",d:24},{n:"荷葉先師聖誕",d:6}],
  7:[{n:"地官大帝聖誕・中元普渡",d:15}],
  8:[{n:"土地公聖誕",d:15},{n:"觀世音菩薩成道",d:22}],
  9:[{n:"九皇大帝聖誕（初一至初九）",d:1},{n:"鬥姥元君聖誕",d:9},{n:"觀世音出家紀念",d:19}],
  10:[{n:"水仙尊王聖誕",d:10},{n:"下元水官聖誕",d:15}],
  11:[{n:"太乙救苦天尊聖誕",d:11},{n:"南斗星君聖誕",d:17}],
  12:[{n:"送神日",d:24},{n:"天地開界・迎玉皇",d:25}],
};

// ── 算法核心 ──
function yearGZ(d){
  const y=d.getFullYear(),ts=d.getTime(),lc=jqDate(y,"立春");
  const ay=(lc&&ts<lc.getTime())?y-1:y;
  return{gan:TG[((ay-4)%10+10)%10],zhi:DZ[((ay-4)%12+12)%12],year:ay};
}
function monthGZ(d){
  const ts=d.getTime(),y=d.getFullYear();
  let bi=-1,bts=-Infinity,bjd=null;
  for(let yr=y-1;yr<=y+1;yr++)
    for(let i=0;i<MJQ.length;i++){
      const jd=jqDate(yr,MJQ[i]);
      if(jd&&jd.getTime()<=ts&&jd.getTime()>bts){bts=jd.getTime();bi=i;bjd=jd;}
    }
  if(bi<0)bi=1;
  const zi=MZI[bi],yg=yearGZ(d);
  const mt={甲:2,己:2,乙:4,庚:4,丙:6,辛:6,丁:8,壬:8,戊:0,癸:0};
  return{gan:TG[(mt[yg.gan]+(zi-2+12)%12)%10],zhi:DZ[zi],jqName:MJQ[bi],jqDate:bjd};
}
function dayGZ(y,m,d){
  const diff=Math.round((new Date(y,m-1,d)-new Date(1992,10,29))/86400000);
  return{gan:TG[((5+diff)%10+10)%10],zhi:DZ[((9+diff)%12+12)%12]};
}
function hourGZ(h,dg){
  const zi=h<1?0:h<3?1:h<5?2:h<7?3:h<9?4:h<11?5:h<13?6:h<15?7:h<17?8:h<19?9:h<21?10:h<23?11:0;
  const ws={甲:0,己:0,乙:2,庚:2,丙:4,辛:4,丁:6,壬:6,戊:8,癸:8};
  return{gan:TG[(ws[dg]+zi)%10],zhi:DZ[zi]};
}
function shiShen(ri,g){
  const rW=TG_WX[ri],gW=TG_WX[g],s=TG_YY[ri]===TG_YY[g];
  const sh={木:"火",火:"土",土:"金",金:"水",水:"木"};
  const ke={木:"土",火:"金",土:"水",金:"木",水:"火"};
  if(rW===gW)return s?"比肩":"劫財";
  if(sh[rW]===gW)return s?"食神":"傷官";
  if(sh[gW]===rW)return s?"正印":"偏印";
  if(ke[rW]===gW)return s?"偏財":"正財";
  if(ke[gW]===rW)return s?"七殺":"正官";
  return"—";
}

// 地支關係分析
function analyzeDZ(dzArr){
  const events=[];
  // 六衝
  for(const[a,b]of CHONG){
    const ai=dzArr.indexOf(a),bi=dzArr.indexOf(b);
    if(ai>=0&&bi>=0) events.push({type:"衝",symbol:"⚡",color:"#A85438",members:[a,b],pos:[ai,bi],
      desc:`${POS[ai]}（${a}）與${POS[bi]}（${b}）相衝，${getChongDesc(ai,bi)}`});
  }
  // 六合
  for(const[a,b,wx]of LIU_HE){
    const ai=dzArr.indexOf(a),bi=dzArr.indexOf(b);
    if(ai>=0&&bi>=0) events.push({type:"六合",symbol:"🤝",color:"#4A8060",members:[a,b],pos:[ai,bi],
      desc:`${POS[ai]}（${a}）與${POS[bi]}（${b}）六合化${wx}，${getHeDesc(ai,bi,"六合",wx)}`});
  }
  // 三合/半合
  for(const[a,b,c,wx]of SAN_HE){
    const has=[a,b,c].filter(x=>dzArr.includes(x));
    if(has.length===3){
      const posArr=has.map(x=>dzArr.indexOf(x));
      events.push({type:"三合",symbol:"✨",color:"#707840",members:has,pos:posArr,
        desc:`${has.join("")}三合${wx}局，命中${wx}氣旺盛，${getWxDesc(wx)}全局加強。`});
    } else if(has.length===2){
      const posArr=has.map(x=>dzArr.indexOf(x));
      events.push({type:"半合",symbol:"🌙",color:"#7A6040",members:has,pos:posArr,
        desc:`${has.join("")}半合${wx}，${wx}氣有所增強，但力量不足三合。`});
    }
  }
  // 六害
  for(const[a,b]of HAI){
    const ai=dzArr.indexOf(a),bi=dzArr.indexOf(b);
    if(ai>=0&&bi>=0) events.push({type:"害",symbol:"⚠️",color:"#8B6060",members:[a,b],pos:[ai,bi],
      desc:`${POS[ai]}（${a}）與${POS[bi]}（${b}）相害，${getHaiDesc(ai,bi)}`});
  }
  // 三刑
  for(const{m,t}of XING_3){
    const has=m.filter(x=>dzArr.includes(x));
    if(has.length===m.length){
      const posArr=has.map(x=>dzArr.indexOf(x));
      events.push({type:"刑",symbol:"🔺",color:"#904040",members:has,pos:posArr,
        desc:`${has.join("")}${t}，易有官司、病痛或人際衝突，需謹慎行事。`});
    }
  }
  for(const{m,t}of XING_2){
    const ai=dzArr.indexOf(m[0]),bi=dzArr.indexOf(m[1]);
    if(ai>=0&&bi>=0) events.push({type:"刑",symbol:"🔺",color:"#904040",members:[m[0],m[1]],pos:[ai,bi],
      desc:`${m.join("")}${t}，言語易有衝突，與人交往需注意禮節與界限。`});
  }
  // 自刑
  for(const x of SELF_X){
    const idxs=[];
    dzArr.forEach((d,i)=>{if(d===x)idxs.push(i);});
    if(idxs.length>=2) events.push({type:"刑",symbol:"🔺",color:"#904040",members:[x,x],pos:idxs,
      desc:`${x}${x}自刑，在${idxs.map(i=>POS[i]).join("、")}，易自我要求過高或鑽牛角尖。`});
  }
  return events;
}

function getChongDesc(a,b){
  const rel=[POS_REL[POS[a][0]],POS_REL[POS[b][0]]];
  const descs={
    "年月":"自身與長輩、父母之間容易有摩擦，溝通需要更多耐心。",
    "年日":"個人與祖先、家族傳承之間有張力，成長過程多有轉折。",
    "年時":"長輩與晚輩之間觀念差距較大，代溝明顯。",
    "月日":"自身成長與父母期望有衝突，容易走出與家庭不同的道路。",
    "月時":"兄弟姐妹與子女緣分有波折，或個人事業與家庭有取捨。",
    "日時":"自身與子女、晚輩關係需要磨合，教育觀念易有分歧。",
  };
  const key=[a<b?POS[a][0]:POS[b][0],a<b?POS[b][0]:POS[a][0]].join("");
  return descs[key]||"兩柱之間能量相互激盪，人生此面向有較多變動。";
}
function getHeDesc(a,b,type,wx){
  return `兩者能量融合，有助於${wx}相關的人際和諧，合作順暢。`;
}
function getHaiDesc(a,b){
  const descs={
    "年月":"長輩與自身之間暗藏不和諧，易有誤解或暗中阻礙。",
    "年日":"家族因素對個人發展有隱性影響，需留意背後的牽絆。",
    "年時":"祖先與後代之間有未解的結，需透過積德行善化解。",
    "月日":"父母或工作環境對個人有暗中壓制，情緒上需加以疏導。",
    "月時":"手足與子女之間暗有不睦，或工作與家庭難以平衡。",
    "日時":"自身與子女之間有隱性的情感羈絆，需多溝通關懷。",
  };
  const key=[a<b?POS[a][0]:POS[b][0],a<b?POS[b][0]:POS[a][0]].join("");
  return descs[key]||"此兩個生命領域之間有隱性的不和諧，需留意。";
}
function getWxDesc(wx){
  const m={木:"生發、成長",火:"熱情、名聲",土:"穩定、信用",金:"決斷、財富",水:"智慧、流動"};
  return m[wx]||"";
}

// 流年流月干支
function getLiuNian(birthYear, count=10){
  const now=new Date().getFullYear();
  return Array.from({length:count},(_,i)=>{
    const y=now+i;
    const gi=((y-4)%10+10)%10,zi=((y-4)%12+12)%12;
    return{year:y,gan:TG[gi],zhi:DZ[zi]};
  });
}
function getLiuYue(year){
  const ygi=((year-4)%10+10)%10,yearGan=TG[ygi];
  const mt={甲:2,己:2,乙:4,庚:4,丙:6,辛:6,丁:8,壬:8,戊:0,癸:0};
  const months=[];
  for(let m=0;m<12;m++){
    const zi=MZI[m+1]!==undefined?MZI[m+1]:(m+2)%12; // 簡化：寅月起
    const zhi=(m+2)%12; // 寅=2開始
    const gi=(mt[yearGan]+m)%10;
    months.push({month:m+1,gan:TG[gi],zhi:DZ[(m+2)%12]});
  }
  return months;
}

function calcBazi(dt){
  const h=dt.getHours(),isWan=h===23;
  const adj=isWan?new Date(dt.getTime()+86400000):dt;
  const yp=yearGZ(adj),mp=monthGZ(adj);
  const dp=dayGZ(adj.getFullYear(),adj.getMonth()+1,adj.getDate());
  const tp=hourGZ(h,dp.gan);
  const ri=dp.gan;
  // 右至左：年月日時
  const pillarsRTL=[yp,mp,dp,tp].map((p,i)=>({
    ...p,label:["年","月","日","時"][i],
    ganWx:TG_WX[p.gan],ss:i===2?"日元":shiShen(ri,p.gan),
    cang:CANG[p.zhi]||[]
  }));
  const dzArr=pillarsRTL.map(p=>p.zhi);
  const dzEvents=analyzeDZ(dzArr);
  // 五行計數（天干只計，不含藏干）
  const wxCount={木:0,火:0,土:0,金:0,水:0};
  pillarsRTL.forEach(p=>{
    wxCount[TG_WX[p.gan]]++;
    wxCount[TG_WX[CANG[p.zhi][0]]]=(wxCount[TG_WX[CANG[p.zhi][0]]]||0); // 僅天干
  });
  // 純四柱八字（天干+地支各4）
  const ganArr=pillarsRTL.map(p=>p.gan);
  const wxGan={木:0,火:0,土:0,金:0,水:0};
  ganArr.forEach(g=>wxGan[TG_WX[g]]++);
  const wxZhi={木:0,火:0,土:0,金:0,水:0};
  dzArr.forEach(z=>wxZhi[TG_WX[CANG[z][0]]]++);
  const wxTotal={};
  for(const wx of Object.keys(wxGan)) wxTotal[wx]=(wxGan[wx]||0)+(wxZhi[wx]||0);

  // 馬花庫
  const maList=dzArr.map((d,i)=>DZ_MA.has(d)?{d,i}:null).filter(Boolean);
  const huaList=dzArr.map((d,i)=>DZ_HUA.has(d)?{d,i}:null).filter(Boolean);
  const kuList=dzArr.map((d,i)=>DZ_KU.has(d)?{d,i}:null).filter(Boolean);

  // 身強弱
  const monthZhi=mp.zhi;
  const riWx=TG_WX[ri];
  const sq=SQ_MAP[riWx]?.has(monthZhi)?"身強":"身弱";

  return{pillars:pillarsRTL,ri,riWx,isWan,dzEvents,
    wxTotal,maList,huaList,kuList,sq,monthZhi,date:dt};
}

function calcFortune(ri,today){
  const dp=dayGZ(today.getFullYear(),today.getMonth()+1,today.getDate());
  const fg=dp.gan,ss=shiShen(ri,fg);
  const R={比肩:3,劫財:2,食神:4,傷官:3,正印:5,偏印:4,偏財:4,正財:5,正官:4,七殺:2};
  const C={
    比肩:"今日能量同頻，適合協作，靜心感受內在力量。",
    劫財:"競爭氣場偏強，財務宜保守，多包容少爭執。",
    食神:"靈感豐沛，享受當下，飲食藝術皆為滋養。",
    傷官:"思維犀利，適合創作突破，說話留意分寸。",
    正印:"貴人運旺，長輩帶來助力，學習考試皆吉。",
    偏印:"直覺敏銳，宜深思獨處，重大決策暫緩。",
    偏財:"偏財流動，靈活應對有意外收穫。",
    正財:"正財穩健，踏實努力有回報。",
    正官:"官運順暢，職場受肯定，守規矩得名聲。",
    七殺:"壓力偏強，化壓力為磨礪，逆境是蛻變起點。",
  };
  return{flowGan:fg,flowWx:TG_WX[fg],ss,rating:R[ss]||3,comment:C[ss]||"平和順勢。"};
}

const p2=n=>String(n).padStart(2,"0");
const fmtDt=d=>`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${p2(d.getHours())}:${p2(d.getMinutes())}`;

// ── UI 元件 ──
function Stars({r,c}){return <span style={{display:"inline-flex",gap:"1px"}}>{[1,2,3,4,5].map(i=><span key={i} style={{fontSize:"11px",color:i<=r?(c||"#7A6040"):"#D4CBC0"}}>{i<=r?"★":"☆"}</span>)}</span>;}
function Bar({r,c}){return <div style={{height:"3px",background:"#EAE4DA",borderRadius:"99px",overflow:"hidden",marginTop:"4px"}}><div style={{width:`${r/5*100}%`,height:"100%",background:c||"#7A6040",borderRadius:"99px",transition:"width 1s ease"}}/></div>;}
function Card({children,mb=10,style={}}){return <div style={{background:"white",borderRadius:"13px",padding:"14px",marginBottom:mb,border:"1px solid #EAE2D8",...style}}>{children}</div>;}
function SectionTitle({children}){return <div style={{fontSize:"9px",color:"#B8A898",letterSpacing:"2px",marginBottom:"10px"}}>{children}</div>;}

// 四柱卡（右至左顯示）
function PillarCard({p,isRi}){
  const gc=WX_C[p.ganWx],gl=WX_LT[p.ganWx];
  return(
    <div style={{flex:1,minWidth:0,borderRadius:"11px",overflow:"hidden",
      border:`1.5px solid ${isRi?gc:"#E5DDD4"}`,
      transform:isRi?"translateY(-3px)":"none",
      boxShadow:isRi?`0 5px 18px ${gc}20`:"0 1px 4px rgba(0,0,0,0.05)",
      background:"white"}}>
      <div style={{background:isRi?gc:gl,padding:"6px 3px",textAlign:"center"}}>
        <div style={{fontSize:"9px",letterSpacing:"1px",fontWeight:600,color:isRi?"white":gc}}>{p.label}柱</div>
        {isRi&&<div style={{fontSize:"7px",color:"rgba(255,255,255,0.7)",marginTop:"1px"}}>日元</div>}
      </div>
      <div style={{padding:"10px 3px 8px",textAlign:"center",background:gl,borderBottom:`1px solid ${gc}12`}}>
        <div style={{fontSize:"26px",fontWeight:600,color:gc,lineHeight:1}}>{p.gan}</div>
        <div style={{fontSize:"8px",color:gc+"80",marginTop:"2px"}}>{TG_YY[p.gan]}{p.ganWx}</div>
        {!isRi&&<div style={{marginTop:"4px",display:"inline-block",fontSize:"8px",fontWeight:600,
          padding:"1px 6px",borderRadius:"99px",background:"white",color:gc,border:`1px solid ${gc}30`}}>{p.ss}</div>}
      </div>
      <div style={{padding:"8px 3px 9px",textAlign:"center",background:"white"}}>
        <div style={{fontSize:"22px",fontWeight:500,color:"#3A3028",lineHeight:1}}>{p.zhi}</div>
        <div style={{marginTop:"4px",fontSize:"9px",color:"#B8A898"}}>
          {DZ_MA.has(p.zhi)?"🐎":DZ_HUA.has(p.zhi)?"🌸":DZ_KU.has(p.zhi)?"📦":""}
        </div>
      </div>
    </div>
  );
}

// 主App
export default function App(){
  const now=new Date();
  const [val,setVal]=useState("1992-11-29T17:30");
  const [res,setRes]=useState(null);
  const [fort,setFort]=useState(null);
  const [tab,setTab]=useState(0);
  const [lyYear,setLyYear]=useState(now.getFullYear());
  const TABS=["命盤","分析","日運","流年","流月"];

  const calc=useCallback(()=>{
    const d=new Date(val);if(isNaN(d))return;
    const r=calcBazi(d);
    setRes(r);setFort(calcFortune(r.ri,new Date()));setTab(0);
  },[val]);
  useEffect(()=>{calc();},[]);

  const riC=res?WX_C[TG_WX[res.ri]]:"#7A6040";
  const riL=res?WX_LT[TG_WX[res.ri]]:"#F2EBE0";

  // 流月資料
  const liuYue=res?getLiuYue(lyYear):[];

  return(
    <div style={{minHeight:"100vh",background:"#F6F2EC",fontFamily:"'Noto Serif TC',Georgia,serif",color:"#3A3028"}}>
      {/* 頂欄 */}
      <div style={{background:"white",borderBottom:"1px solid #EAE2D8",padding:"18px 16px 14px",textAlign:"center",position:"sticky",top:0,zIndex:10,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
        <div style={{fontSize:"9px",color:"#C0B0A0",letterSpacing:"4px",marginBottom:"4px"}}>命 理 推 算</div>
        <div style={{fontSize:"18px",fontWeight:600,letterSpacing:"3px",color:"#2E2820"}}>八字排盤</div>
      </div>

      <div style={{maxWidth:"430px",margin:"0 auto",padding:"13px 13px 60px"}}>
        {/* 輸入 */}
        <Card mb={12}>
          <SectionTitle>出生時間</SectionTitle>
          <div style={{display:"flex",gap:"8px"}}>
            <input type="datetime-local" value={val} onChange={e=>setVal(e.target.value)}
              style={{flex:1,padding:"9px 10px",border:"1px solid #DDD4C8",borderRadius:"9px",fontSize:"13px",color:"#3A3028",background:"#FAF8F4",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            <button onClick={calc}
              style={{padding:"9px 15px",background:"#2E2820",color:"#F5EDD8",border:"none",borderRadius:"9px",fontSize:"11px",fontWeight:600,letterSpacing:"2px",cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              排盤
            </button>
          </div>
        </Card>

        {res&&<>
          {/* 日元條 */}
          <div style={{background:"white",borderRadius:"12px",padding:"11px 13px",marginBottom:"10px",border:`1px solid ${riC}25`,display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"40px",height:"40px",borderRadius:"10px",flexShrink:0,background:riL,border:`1px solid ${riC}40`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:"18px",fontWeight:600,color:riC,lineHeight:1}}>{res.ri}</div>
              <div style={{fontSize:"8px",color:riC+"70",marginTop:"1px"}}>{res.riWx}</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:"9px",color:"#B8A898"}}>命主日元・{TG_YY[res.ri]}{res.riWx}</div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"3px"}}>
                <span style={{fontSize:"14px",fontWeight:600,color:"#2E2820"}}>{res.ri}日主</span>
                <span style={{fontSize:"10px",fontWeight:700,padding:"2px 8px",borderRadius:"99px",
                  background:res.sq==="身強"?"#EBF3EE":"#F6EAE4",
                  color:res.sq==="身強"?"#4A8060":"#A85438",
                  border:`1px solid ${res.sq==="身強"?"#4A806040":"#A8543840"}`}}>
                  {res.sq}
                </span>
              </div>
            </div>
            <div style={{fontSize:"11px",color:"#9A8A7A",letterSpacing:"1px",lineHeight:2,textAlign:"right",fontWeight:500}}>
              {res.pillars.slice(0,2).map(p=>p.gan+p.zhi).join(" ")}<br/>
              {res.pillars.slice(2).map(p=>p.gan+p.zhi).join(" ")}
            </div>
          </div>

          {/* Tab */}
          <div style={{display:"flex",background:"white",borderRadius:"11px",padding:"3px",border:"1px solid #EAE2D8",marginBottom:"10px",gap:"2px"}}>
            {TABS.map((t,i)=>(
              <button key={t} onClick={()=>setTab(i)}
                style={{flex:1,padding:"7px 2px",border:"none",borderRadius:"8px",fontFamily:"inherit",fontSize:"10px",fontWeight:600,letterSpacing:"0.5px",cursor:"pointer",transition:"all .2s",
                  background:tab===i?"#2E2820":"transparent",color:tab===i?"#F5EDD8":"#A89880"}}>
                {t}
              </button>
            ))}
          </div>

          {/* ── 命盤 Tab ── */}
          {tab===0&&<>
            {res.isWan&&<div style={{background:"#E4EEF5",border:"1px solid #3A687830",borderRadius:"10px",padding:"8px 12px",marginBottom:"9px",fontSize:"10px",color:"#2A5868"}}>
              🌙 <strong>晚子時（流派二）</strong>：23時出生，日柱已進位隔日。
            </div>}

            {/* 四柱（右至左：年→時） */}
            <Card mb={10}>
              <SectionTitle>四柱命盤（由右至左：年月日時）</SectionTitle>
              <div style={{display:"flex",gap:"6px",flexDirection:"row-reverse"}}>
                {res.pillars.map((p,i)=><PillarCard key={i} p={p} isRi={i===2}/>)}
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:"12px",marginTop:"10px",flexWrap:"wrap"}}>
                {Object.entries(WX_C).map(([wx,c])=>(
                  <div key={wx} style={{display:"flex",alignItems:"center",gap:"3px",fontSize:"9px",color:"#8A7A6A"}}>
                    <div style={{width:"6px",height:"6px",borderRadius:"50%",background:c}}/>{wx}
                  </div>
                ))}
              </div>
            </Card>

            {/* 身強弱說明 */}
            <Card mb={10}>
              <SectionTitle>身強身弱判定</SectionTitle>
              <div style={{display:"flex",alignItems:"flex-start",gap:"10px"}}>
                <div style={{width:"44px",height:"44px",flexShrink:0,borderRadius:"10px",
                  background:res.sq==="身強"?"#EBF3EE":"#F6EAE4",
                  border:`1.5px solid ${res.sq==="身強"?"#4A8060":"#A85438"}`,
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:"14px",fontWeight:700,color:res.sq==="身強"?"#4A8060":"#A85438"}}>{res.sq==="身強"?"強":"弱"}</div>
                </div>
                <div style={{flex:1,fontSize:"11px",color:"#5A4E45",lineHeight:1.8}}>
                  <strong>{res.ri}（{res.riWx}）</strong> 日主，生於 <strong>{res.monthZhi}月</strong>。<br/>
                  {res.sq==="身強"
                    ? `${res.monthZhi}月為${res.riWx}旺盛之季，月令得力，日主氣旺為身強。身強宜洩宜剋，財官食傷為喜。`
                    : `${res.monthZhi}月不利${res.riWx}，月令失令，日主氣弱為身弱。身弱宜生宜扶，印綬比劫為喜。`}
                </div>
              </div>
            </Card>

            {/* 五行分佈 */}
            <Card mb={10}>
              <SectionTitle>五行分佈（四柱八字天干＋地支主氣）</SectionTitle>
              {(()=>{
                const counts={};
                res.pillars.forEach(p=>{
                  counts[TG_WX[p.gan]]=(counts[TG_WX[p.gan]]||0)+1;
                  counts[TG_WX[CANG[p.zhi][0]]]=(counts[TG_WX[CANG[p.zhi][0]]]||0)+1;
                });
                return <div style={{display:"flex",gap:"7px",marginBottom:"10px"}}>
                  {["木","火","土","金","水"].map(wx=>{
                    const v=counts[wx]||0;
                    const label=v===0?"缺乏":v<=2?"均衡":"過旺";
                    const lc=v===0?"#A85438":v<=2?"#4A8060":"#707840";
                    return <div key={wx} style={{flex:1,textAlign:"center",padding:"9px 4px",borderRadius:"9px",background:WX_LT[wx],border:`1px solid ${WX_C[wx]}25`}}>
                      <div style={{fontSize:"13px",fontWeight:700,color:WX_C[wx]}}>{wx}</div>
                      <div style={{fontSize:"18px",fontWeight:700,color:WX_C[wx],margin:"3px 0",lineHeight:1}}>{v}</div>
                      <div style={{fontSize:"8px",fontWeight:600,color:lc}}>{label}</div>
                    </div>;
                  })}
                </div>;
              })()}
              <div style={{fontSize:"10px",color:"#8A7A6A",lineHeight:1.9,background:"#FAF8F4",borderRadius:"8px",padding:"9px 10px"}}>
                ▸ <strong>缺（0）</strong>：此五行力量不足，對應臟腑（黃帝內經）易有不及之症。<br/>
                ▸ <strong>均衡（1-2）</strong>：運行順暢，身心平衡，最為理想。<br/>
                ▸ <strong>過旺（3+）</strong>：過猶不及，過盛之氣反為病因，需以相剋五行調和。
              </div>
            </Card>

            {/* 馬花庫 */}
            <Card mb={0}>
              <SectionTitle>地支馬花庫</SectionTitle>
              {[
                {type:"馬",icon:"🐎",color:"#3A6878",list:res.maList,
                  desc:["無驛馬，人生相對穩定，不愛奔波流動。","一馬在命，有一定的行動力與變動機緣。","二馬入局，行動力強，喜四處奔走，易有外出發展機會。","三馬齊驅，一生奔忙，宜往外地發展，靜不下來。","四馬衝動，行動力極強，但易流於漂泊，需找到落腳點。"]},
                {type:"花",icon:"🌸",color:"#A85438",list:res.huaList,
                  desc:["無桃花，人際較為平淡，感情緣分平順但不強烈。","一朵桃花，有一定的異性緣與人際吸引力。","雙桃花，魅力出眾，人緣極好，感情選擇多，需謹慎。","三桃花，桃花泛濫，感情易生波折，宜珍重感情。","四桃花（罕見），感情複雜，人際關係需要謹慎經營。"]},
                {type:"庫",icon:"📦",color:"#707840",list:res.kuList,
                  desc:["無庫，財不易積，需善加理財，錢財易進易出。","一庫，有一定的積蓄能力，財物有所保管。","雙庫，儲蓄能力強，但庫多易成守財，或有家族產業。","三庫，財庫豐盛，但可能有沉重的責任與壓力伴隨。","四庫全（罕見），聚斂能力極強，但也要注意健康與開支。"]},
              ].map(({type,icon,color,list,desc})=>(
                <div key={type} style={{marginBottom:"10px",padding:"10px 11px",background:WX_LT[WX_C[color]??"木"]||"#F5F1EC",borderRadius:"10px",border:`1px solid ${color}20`}}>
                  <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"5px"}}>
                    <span style={{fontSize:"15px"}}>{icon}</span>
                    <span style={{fontSize:"11px",fontWeight:700,color}}>{type}星（{list.length}個）{list.length>0?`：${list.map(x=>x.d+POS[x.i][0]).join("、")}`:""}
                    </span>
                  </div>
                  <div style={{fontSize:"10px",color:"#6A5A4A",lineHeight:1.7}}>{desc[Math.min(list.length,4)]}</div>
                </div>
              ))}
            </Card>
          </>}

          {/* ── 分析 Tab（衝合害刑） ── */}
          {tab===1&&<>
            <Card mb={10}>
              <SectionTitle>地支關係分析</SectionTitle>
              {res.dzEvents.length===0
                ? <div style={{fontSize:"11px",color:"#B8A898",textAlign:"center",padding:"16px 0"}}>命盤地支無明顯衝合害刑，格局較為平和。</div>
                : res.dzEvents.map((ev,i)=>(
                  <div key={i} style={{padding:"11px 12px",marginBottom:"8px",borderRadius:"10px",
                    background:"white",border:`1px solid ${ev.color}20`,boxShadow:`0 1px 4px ${ev.color}12`}}>
                    <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"5px"}}>
                      <span style={{fontSize:"14px"}}>{ev.symbol}</span>
                      <span style={{fontSize:"10px",fontWeight:700,padding:"1px 8px",borderRadius:"99px",
                        background:ev.color+"15",color:ev.color,border:`1px solid ${ev.color}30`}}>
                        {ev.members.join("")} {ev.type}
                      </span>
                      <span style={{fontSize:"9px",color:"#B8A898"}}>
                        {ev.pos.map(p=>POS[p]).join("×")}
                      </span>
                    </div>
                    <div style={{fontSize:"10px",color:"#5A4E45",lineHeight:1.75}}>{ev.desc}</div>
                  </div>
                ))
              }
            </Card>
            <Card mb={10}>
              <SectionTitle>十神速覽</SectionTitle>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"7px"}}>
                {res.pillars.filter(p=>p.ss!=="日元").map((p,i)=>{
                  const gc=WX_C[p.ganWx],gl=WX_LT[p.ganWx];
                  return <div key={i} style={{padding:"9px 6px",borderRadius:"9px",textAlign:"center",background:gl,border:`1px solid ${gc}18`}}>
                    <div style={{fontSize:"9px",color:"#B8A898",marginBottom:"2px"}}>{p.label}柱</div>
                    <div style={{fontSize:"20px",fontWeight:600,color:gc,lineHeight:1}}>{p.gan}</div>
                    <div style={{marginTop:"4px",display:"inline-block",fontSize:"9px",fontWeight:600,padding:"1px 6px",borderRadius:"99px",background:"white",color:gc,border:`1px solid ${gc}28`}}>{p.ss}</div>
                  </div>;
                })}
              </div>
            </Card>
          </>}

          {/* ── 日運 Tab ── */}
          {tab===2&&fort&&<>
            <Card mb={10}>
              <SectionTitle>今日運勢・{now.getFullYear()}年{now.getMonth()+1}月{now.getDate()}日</SectionTitle>
              <div style={{display:"flex",alignItems:"flex-start",gap:"11px"}}>
                <div style={{width:"52px",height:"52px",flexShrink:0,borderRadius:"12px",background:WX_LT[fort.flowWx],border:`1px solid ${WX_C[fort.flowWx]}45`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div style={{fontSize:"22px",fontWeight:600,color:WX_C[fort.flowWx],lineHeight:1}}>{fort.flowGan}</div>
                  <div style={{fontSize:"8px",color:WX_C[fort.flowWx]+"80",marginTop:"2px"}}>{fort.flowWx}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:"7px",flexWrap:"wrap",marginBottom:"6px"}}>
                    <span style={{fontSize:"11px",fontWeight:600,padding:"2px 9px",borderRadius:"99px",background:WX_LT[fort.flowWx],color:WX_C[fort.flowWx],border:`1px solid ${WX_C[fort.flowWx]}35`}}>{fort.ss}</span>
                    <Stars r={fort.rating} c={WX_C[fort.flowWx]}/>
                    <span style={{fontSize:"9px",color:"#C8B8A8"}}>{fort.rating}/5</span>
                  </div>
                  <Bar r={fort.rating} c={WX_C[fort.flowWx]}/>
                  <div style={{fontSize:"9px",color:"#B8A898",marginTop:"5px"}}>{res.ri}（{res.riWx}）遇{fort.flowGan}（{fort.flowWx}）→ {fort.ss}</div>
                </div>
              </div>
              <div style={{marginTop:"11px",padding:"11px 12px",background:"#FAF8F4",borderRadius:"9px",fontSize:"12px",lineHeight:1.9,color:"#5A4E45",borderLeft:`2px solid ${WX_C[fort.flowWx]}`}}>{fort.comment}</div>
            </Card>
            <Card>
              <SectionTitle>今日各維度</SectionTitle>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>
                {[["財運",fort.rating>=4?fort.rating:Math.max(2,fort.rating),"金"],["事業",fort.rating,"木"],["人際",Math.min(5,fort.rating>=3?fort.rating+1:fort.rating),"火"],["健康",Math.max(3,fort.rating),"水"]].map(([lbl,sc,wx])=>(
                  <div key={lbl} style={{padding:"10px",borderRadius:"9px",background:WX_LT[wx],border:`1px solid ${WX_C[wx]}18`}}>
                    <div style={{fontSize:"9px",color:"#B8A898",marginBottom:"3px"}}>{lbl}</div>
                    <div style={{fontSize:"17px",fontWeight:600,color:WX_C[wx],lineHeight:1}}>{sc}<span style={{fontSize:"9px",color:"#C8B8A8"}}>/5</span></div>
                    <Bar r={sc} c={WX_C[wx]}/>
                  </div>
                ))}
              </div>
            </Card>
          </>}

          {/* ── 流年 Tab ── */}
          {tab===3&&<>
            <Card mb={10}>
              <SectionTitle>未來10年流年運勢</SectionTitle>
              {getLiuNian(res.date.getFullYear(),10).map((ly,i)=>{
                const ss=shiShen(res.ri,ly.gan);
                const gc=WX_C[TG_WX[ly.gan]];
                const gl=WX_LT[TG_WX[ly.gan]];
                const R={比肩:3,劫財:2,食神:4,傷官:3,正印:5,偏印:4,偏財:4,正財:5,正官:4,七殺:2};
                const rat=R[ss]||3;
                const desc={比肩:"平穩，宜強化自身實力與人脈。",劫財:"競爭較強，謹慎財務決策。",食神:"創意旺盛，適合發展個人才藝。",傷官:"突破創新年，但需避免衝突。",正印:"貴人助力年，進修學習吉。",偏印:"直覺靈敏，適合研究探索。",偏財:"偏財運旺，靈活把握機遇。",正財:"正財穩健，腳踏實地有成。",正官:"官運順暢，職場晉升有望。",七殺:"挑戰較多，磨礪後更強大。"};
                return <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 11px",marginBottom:"7px",borderRadius:"10px",background:i===0?"#FAF8F4":gl,border:`1px solid ${gc}20`}}>
                  <div style={{width:"36px",flexShrink:0,textAlign:"center"}}>
                    <div style={{fontSize:"11px",fontWeight:700,color:gc}}>{ly.gan}{ly.zhi}</div>
                    <div style={{fontSize:"10px",color:"#B8A898"}}>{ly.year}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"3px"}}>
                      <span style={{fontSize:"10px",fontWeight:600,padding:"1px 7px",borderRadius:"99px",background:"white",color:gc,border:`1px solid ${gc}30`}}>{ss}</span>
                      <Stars r={rat} c={gc}/>
                    </div>
                    <div style={{fontSize:"10px",color:"#6A5A4A",lineHeight:1.5}}>{desc[ss]||""}</div>
                  </div>
                </div>;
              })}
            </Card>
          </>}

          {/* ── 流月 Tab ── */}
          {tab===4&&res&&<>
            <Card mb={10}>
              <SectionTitle>流月運勢</SectionTitle>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
                <button onClick={()=>setLyYear(y=>y-1)} style={{padding:"4px 10px",background:"#F0EBE4",border:"none",borderRadius:"7px",cursor:"pointer",fontSize:"12px"}}>◀</button>
                <div style={{flex:1,textAlign:"center",fontSize:"13px",fontWeight:600,color:"#2E2820"}}>{lyYear} 年流月</div>
                <button onClick={()=>setLyYear(y=>y+1)} style={{padding:"4px 10px",background:"#F0EBE4",border:"none",borderRadius:"7px",cursor:"pointer",fontSize:"12px"}}>▶</button>
              </div>
              {(()=>{
                const ygi=((lyYear-4)%10+10)%10,yearGan=TG[ygi],yearZhi=DZ[((lyYear-4)%12+12)%12];
                const mt={甲:2,己:2,乙:4,庚:4,丙:6,辛:6,丁:8,壬:8,戊:0,癸:0};
                const MNAMES=["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"];
                return MNAMES.map((mz,mi)=>{
                  const mgan=TG[(mt[yearGan]+mi)%10];
                  const ss=shiShen(res.ri,mgan);
                  const gc=WX_C[TG_WX[mgan]];
                  const gl=WX_LT[TG_WX[mgan]];
                  const R={比肩:3,劫財:2,食神:4,傷官:3,正印:5,偏印:4,偏財:4,正財:5,正官:4,七殺:2};
                  const rat=R[ss]||3;
                  // 農曆月（寅月=農曆1月）
                  const lunarM=mi+1;
                  const sacred=SACRED[lunarM]||[];
                  return <div key={mi} style={{marginBottom:"9px",borderRadius:"11px",overflow:"hidden",border:`1px solid ${gc}20`}}>
                    <div style={{background:gl,padding:"8px 11px",display:"flex",alignItems:"center",gap:"8px"}}>
                      <div style={{fontSize:"10px",fontWeight:700,color:gc,minWidth:"28px"}}>農曆{lunarM}月</div>
                      <div style={{fontSize:"13px",fontWeight:700,color:gc}}>{mgan}{mz}</div>
                      <span style={{fontSize:"10px",padding:"1px 7px",borderRadius:"99px",background:"white",color:gc,border:`1px solid ${gc}28`}}>{ss}</span>
                      <Stars r={rat} c={gc}/>
                    </div>
                    {sacred.length>0&&<div style={{background:"white",padding:"7px 11px",borderTop:`1px solid ${gc}12`}}>
                      <div style={{fontSize:"9px",color:"#C0A060",marginBottom:"3px",letterSpacing:"1px"}}>✦ 本月神明聖誕祈福吉日</div>
                      {sacred.map((s,si)=>(
                        <div key={si} style={{fontSize:"10px",color:"#5A4E45",lineHeight:1.6}}>
                          農曆{lunarM}月{s.d}日・{s.n}
                        </div>
                      ))}
                    </div>}
                  </div>;
                });
              })()}
            </Card>
          </>}

        </>}
        <div style={{textAlign:"center",marginTop:"24px",fontSize:"9px",color:"#C8B8A8",letterSpacing:"2px"}}>命理僅供參考・心態決定運勢</div>
      </div>
    </div>
  );
}
