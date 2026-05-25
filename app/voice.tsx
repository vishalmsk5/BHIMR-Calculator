import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { evaluate, sin, cos, tan, asin, acos, atan, log, log10, sqrt, factorial, pi } from 'mathjs';
import { WebView } from 'react-native-webview';
import { useThemeStore } from '../store/useThemeStore';
import { useVoiceHistoryStore } from '../store/useCalculatorStore';
import { SafeAreaView } from 'react-native-safe-area-context';

let MEMORY = 0;
let LAST_ANS = 0;

async function ultimateParse(input: string): Promise<{ answer: string; display: string; speak: string; }> {
  const fmt = (n: number): string => {
    if (!isFinite(n) || isNaN(n)) return 'Error';
    if (Math.abs(n) >= 1e10 || (Math.abs(n) < 1e-7 && n !== 0)) return n.toExponential(4);
    return parseFloat(n.toPrecision(10)).toString();
  };

  let t = input.trim();
  t = t.replace(/[\s+\-*/×÷xX]+$/g, '').trim();
  if (!t) return { answer: 'Please say a complete calculation', display: '', speak: 'Please say a complete calculation' };

  // ─── PRE-NORMALIZE STT quirks ───
  t = t.replace(/जी\s*एस\s*टी/g, 'GST').replace(/जीएसटी/g, 'GST');
  t = t.replace(/\bएटीन\b/g, '18');
  t = t.replace(/\bपर्सन\b|\bपरसेन्ट\b|\bपर्सेंट\b|\bपरसेंट\b|\bप्रतिशत\b|\bफीसदी\b|\bटक्के\b/g, 'percent');
  t = t.replace(/\bऑन\b|\bएन\b/g, 'on');
  t = t.replace(/\boneplus\b/gi, '1 plus').replace(/\bone\s*\+/gi, '1 +');
  t = t.replace(/\bस्प्लिट\b|\bवाटा\b|\bविभागा\b|\bवाटून\b|\bभागा\b/g, 'split');
  t = t.replace(/\bमाणसांमध्ये\b|\bलोकांमध्ये\b|\bलोकांत\b|\bमाणूस\b|\bमाणसे\b|\bलोग\b|\bमाणस\b/g, 'people');

  // ─── STT noise removal ───
  // Remove filler phrases that STT adds before/after the calculation
  t = t.replace(/^(?:उत्तर\s*(?:आहे|आह|असेल)?\s*)/i, '');
  t = t.replace(/^(?:देखिए\s*(?:जवाब)?\s*)/i, '');
  t = t.replace(/^(?:जवाब|answer|uttar|javab)\s*/i, '');
  t = t.replace(/\s*(?:समजले\s*नाही|समज\s*नाही|समजत\s*नाही)\s*$/i, '');
  t = t.replace(/\s*(?:हे\s*उत्तर\s*आहे|हे\s*बरोबर|छान)\s*$/i, '');
  t = t.replace(/\s*(?:समझ\s*लेना|समझ\s*लो|है\s*ना)\s*$/i, '');
  t = t.trim();

  const tl = t.toLowerCase();

  // ─── SPECIAL CALCULATIONS ───

  // GST
  const gstMatch = tl.match(/gst\s*(\d+(?:\.\d+)?)\s*(?:percent|%)?\s*(?:on|वर|pe|पे|par|ann)?\s*(\d+(?:\.\d+)?)/i)
    || tl.match(/(\d+(?:\.\d+)?)\s*(?:percent|%)\s*gst\s*(?:on|वर)?\s*(\d+(?:\.\d+)?)/i);
  if (gstMatch) {
    const rate = parseFloat(gstMatch[1]), amt = parseFloat(gstMatch[2]);
    const gstAmt = (amt * rate) / 100, total = amt + gstAmt;
    return {
      answer: total.toFixed(2),
      display: `GST ${rate}% on ₹${amt}\nGST Amount: ₹${gstAmt.toFixed(2)}\nTotal: ₹${total.toFixed(2)}`,
      speak: `GST ${rate} percent on ${amt} rupees. GST is ${gstAmt.toFixed(2)} rupees. Total is ${total.toFixed(2)} rupees.`,
    };
  }

  // EMI
  const emiMatch = tl.match(/emi.*?(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)?.*?(\d+(?:\.\d+)?)\s*(?:percent|%).*?(\d+)\s*(?:year|yr|वर्ष|साल)/i);
  if (emiMatch) {
    let p = parseFloat(emiMatch[1]);
    if (/lakh|lac|लाख/i.test(tl)) p *= 100000;
    const r = parseFloat(emiMatch[2]) / 12 / 100, n = parseInt(emiMatch[3]) * 12;
    const em = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return {
      answer: em.toFixed(2),
      display: `Principal: ₹${p.toLocaleString()}\nEMI: ₹${em.toFixed(2)}/month\nTotal: ₹${(em * n).toFixed(2)}\nInterest: ₹${((em * n) - p).toFixed(2)}`,
      speak: `Monthly EMI is ${em.toFixed(2)} rupees.`,
    };
  }

  // Discount
  const discMatch = tl.match(/(\d+(?:\.\d+)?)\s*(?:percent|%)\s*(?:discount|off|सूट|सवलत|छूट).*?(\d+(?:\.\d+)?)/i)
    || tl.match(/(\d+(?:\.\d+)?)\s*(?:discount|off).*?(\d+(?:\.\d+)?)\s*(?:percent|%)/i);
  if (discMatch) {
    const rate = parseFloat(discMatch[1]), amt = parseFloat(discMatch[2]);
    const d = (amt * rate) / 100, final = amt - d;
    return {
      answer: final.toFixed(2),
      display: `${rate}% off ₹${amt}\nDiscount: ₹${d.toFixed(2)}\nFinal: ₹${final.toFixed(2)}`,
      speak: `${rate} percent discount. You save ${d.toFixed(2)}. Final price is ${final.toFixed(2)} rupees.`,
    };
  }

  // Split
  const splitMatch = tl.match(/(?:split|divide|share)\s+(\d+(?:\.\d+)?)\s*(?:rupees?|rs\.?)?\s*(?:between|among|by|for|into|in)?\s*(\d+)\s*(?:people|person|persons|friends|log|माणस)/i)
    || tl.match(/(?:split|divide)\s*(\d+(?:\.\d+)?)\s*(?:by|into|for|between|among)?\s*(\d+)/i)
    || tl.match(/(\d+(?:\.\d+)?)\s*(?:split|divide)\s*(?:by|into|for)?\s*(\d+)/i);
  if (splitMatch) {
    const total = parseFloat(splitMatch[1]), people = parseInt(splitMatch[2]);
    if (!isNaN(total) && !isNaN(people) && people > 0) {
      const each = total / people;
      return {
        answer: each.toFixed(2),
        display: `Total: ₹${total}\nPeople: ${people}\nEach pays: ₹${each.toFixed(2)}`,
        speak: `Split ${total} rupees among ${people} people. Each pays ${each.toFixed(2)} rupees.`,
      };
    }
  }

  // Profit/Loss
  const profitMatch = tl.match(/(?:bought|cost|kharida).*?(\d+(?:\.\d+)?).*?(?:sell|sold|becha).*?(\d+(?:\.\d+)?)/i);
  if (profitMatch) {
    const cost = parseFloat(profitMatch[1]), sell = parseFloat(profitMatch[2]);
    const pl = sell - cost, pct = ((pl / cost) * 100).toFixed(2);
    return {
      answer: pl.toFixed(2),
      display: pl >= 0
        ? `Cost: ₹${cost}\nSell: ₹${sell}\nProfit: ₹${pl.toFixed(2)} (${pct}%)`
        : `Cost: ₹${cost}\nSell: ₹${sell}\nLoss: ₹${Math.abs(pl).toFixed(2)} (${Math.abs(parseFloat(pct))}%)`,
      speak: pl >= 0 ? `Profit of ${pl.toFixed(2)} rupees.` : `Loss of ${Math.abs(pl).toFixed(2)} rupees.`,
    };
  }

  // Currency
  const currMatch = tl.match(/(\d+(?:\.\d+)?)\s*(?:dollar|usd|\$).*?(?:in|to)\s*(?:rupee|inr|₹)/i)
    || tl.match(/(\d+(?:\.\d+)?)\s*(?:dollar|usd)/i);
  if (currMatch) {
    const usd = parseFloat(currMatch[1]);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      const rate = data?.rates?.INR || 83.5;
      const inr = usd * rate;
      return {
        answer: inr.toFixed(2),
        display: `$${usd} ≈ ₹${inr.toFixed(2)}\nRate: 1 USD = ₹${rate.toFixed(2)}`,
        speak: `${usd} dollar is ${inr.toFixed(2)} rupees. Today's rate is 1 dollar equals ${rate.toFixed(2)} rupees.`,
      };
    } catch {
      const inr = usd * 83.5;
      return { answer: inr.toFixed(2), display: `$${usd} ≈ ₹${inr.toFixed(2)}`, speak: `${usd} dollars is approximately ${inr.toFixed(2)} rupees.` };
    }
  }

  // Memory
  if (/memory plus|M\+/i.test(t)) { MEMORY += LAST_ANS; return { answer: `M=${MEMORY}`, display: `Memory: ${MEMORY}`, speak: `Memory is ${MEMORY}` }; }
  if (/memory minus|M\-/i.test(t)) { MEMORY -= LAST_ANS; return { answer: `M=${MEMORY}`, display: `Memory: ${MEMORY}`, speak: `Memory is ${MEMORY}` }; }
  if (/memory recall|RCL/i.test(t)) { return { answer: MEMORY.toString(), display: `Memory: ${MEMORY}`, speak: `Memory is ${MEMORY}` }; }
  if (/memory clear|MC/i.test(t)) { MEMORY = 0; return { answer: 'Cleared', display: 'Memory: 0', speak: 'Memory cleared' }; }
  if (/\bans\b|\blast answer\b/i.test(t)) { return { answer: LAST_ANS.toString(), display: `Ans: ${LAST_ANS}`, speak: `Last answer is ${LAST_ANS}` }; }

  // Scientific
  let num = 0;
  const numMatch = t.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) num = parseFloat(numMatch[1]);

  if (/sin\s*inverse|arc\s*sin|sin⁻¹/i.test(t)) { const r = (asin(num)*180)/pi; return { answer: fmt(r), display: `sin⁻¹(${num})=${fmt(r)}°`, speak: `Arc sin of ${num} is ${fmt(r)} degrees` }; }
  if (/cos\s*inverse|arc\s*cos|cos⁻¹/i.test(t)) { const r = (acos(num)*180)/pi; return { answer: fmt(r), display: `cos⁻¹(${num})=${fmt(r)}°`, speak: `Arc cos of ${num} is ${fmt(r)} degrees` }; }
  if (/tan\s*inverse|arc\s*tan|tan⁻¹/i.test(t)) { const r = (atan(num)*180)/pi; return { answer: fmt(r), display: `tan⁻¹(${num})=${fmt(r)}°`, speak: `Arc tan of ${num} is ${fmt(r)} degrees` }; }
  if (/\bsin(?:e)?\b/i.test(t) && !/inverse|arc/i.test(t)) { const r = sin((num*pi)/180); return { answer: fmt(r), display: `sin(${num}°)=${fmt(r)}`, speak: `Sine of ${num} is ${fmt(r)}` }; }
  if (/\bcos(?:ine)?\b/i.test(t) && !/inverse|arc/i.test(t)) { const r = cos((num*pi)/180); return { answer: fmt(r), display: `cos(${num}°)=${fmt(r)}`, speak: `Cosine of ${num} is ${fmt(r)}` }; }
  if (/\btan(?:gent)?\b/i.test(t) && !/inverse|arc/i.test(t)) { const r = tan((num*pi)/180); return { answer: fmt(r), display: `tan(${num}°)=${fmt(r)}`, speak: `Tangent of ${num} is ${fmt(r)}` }; }
  if (/\blog\b/i.test(t) && !/ln/i.test(t)) { const r = log10(num); return { answer: fmt(r), display: `log(${num})=${fmt(r)}`, speak: `Log of ${num} is ${fmt(r)}` }; }
  if (/\bln\b|natural log/i.test(t)) { const r = log(num) as number; return { answer: fmt(r), display: `ln(${num})=${fmt(r)}`, speak: `Natural log of ${num} is ${fmt(r)}` }; }
  if (/square root|sqrt|root of/i.test(t)) { const r = sqrt(num) as number; return { answer: fmt(r), display: `√${num}=${fmt(r)}`, speak: `Square root of ${num} is ${fmt(r)}` }; }
  if (/\bsquared?\b|x²/i.test(t)) { const r = num*num; return { answer: fmt(r), display: `${num}²=${fmt(r)}`, speak: `${num} squared is ${fmt(r)}` }; }
  if (/\bcubed?\b|x³/i.test(t)) { const r = num*num*num; return { answer: fmt(r), display: `${num}³=${fmt(r)}`, speak: `${num} cubed is ${fmt(r)}` }; }
  if (/\bfactorial\b|n!/i.test(t)) { const r = factorial(Math.floor(num)) as number; return { answer: fmt(r), display: `${num}!=${fmt(r)}`, speak: `${num} factorial is ${fmt(r)}` }; }
  if (/\breciprocal\b|x⁻¹/i.test(t)) { const r = 1/num; return { answer: fmt(r), display: `1/${num}=${fmt(r)}`, speak: `Reciprocal is ${fmt(r)}` }; }
  if (/\bpi\b|π/i.test(t) && !numMatch) { return { answer: pi.toString(), display: `π=${pi}`, speak: `Pi is ${pi.toFixed(6)}` }; }
  const ncrM = t.match(/(\d+)\s*(?:nCr|choose|C)\s*(\d+)/i);
  if (ncrM) { const n=parseInt(ncrM[1]),r=parseInt(ncrM[2]); const res=factorial(n)/(factorial(r)*factorial(n-r)); return { answer: fmt(res as number), display: `${n}C${r}=${fmt(res as number)}`, speak: `${n} choose ${r} is ${fmt(res as number)}` }; }

  // ─── NUMBER WORDS → DIGITS ───
  // STEP 1: Replace Marathi number words
  const marathiNums: Record<string, string> = {
    'शून्य':'0','एक':'1','दोन':'2','तीन':'3','चार':'4','पाच':'5',
    'सहा':'6','सात':'7','आठ':'8','नऊ':'9','दहा':'10','अकरा':'11','बारा':'12','तेरा':'13',
    'चौदा':'14','पंधरा':'15','सोळा':'16','सतरा':'17','अठरा':'18','एकोणीस':'19',
    'वीस':'20','तीस':'30','चाळीस':'40','पन्नास':'50','साठ':'60','सत्तर':'70','ऐंशी':'80','नव्वद':'90',
    'शंभर':'100','हजार':'1000','लाख':'100000',
  };

  // STEP 2: Replace Hindi number words
  const hindiNums: Record<string, string> = {
    'शून्य':'0','एक':'1','दो':'2','तीन':'3','चार':'4','पाँच':'5','पांच':'5',
    'छह':'6','सात':'7','आठ':'8','नौ':'9','दस':'10',
    'ग्यारह':'11','बारह':'12','तेरह':'13','चौदह':'14','पंद्रह':'15','सोलह':'16',
    'सत्रह':'17','अठारह':'18','उन्नीस':'19','बीस':'20','तीस':'30','चालीस':'40',
    'पचास':'50','साठ':'60','सत्तर':'70','अस्सी':'80','नब्बे':'90','सौ':'100','हज़ार':'1000',
  };

  // STEP 3: Replace English number words (compound first)
  const englishNums: Record<string, string> = {
    'five hundred':'500','one hundred':'100','two hundred':'200','three hundred':'300',
    'four hundred':'400','six hundred':'600','seven hundred':'700','eight hundred':'800','nine hundred':'900',
    'one thousand':'1000','two thousand':'2000','five thousand':'5000','ten thousand':'10000',
    'one lakh':'100000','five lakh':'500000',
    'zero':'0','one':'1','two':'2','three':'3','four':'4','five':'5',
    'six':'6','seven':'7','eight':'8','nine':'9','ten':'10',
    'eleven':'11','twelve':'12','thirteen':'13','fourteen':'14','fifteen':'15',
    'sixteen':'16','seventeen':'17','eighteen':'18','nineteen':'19','twenty':'20',
    'thirty':'30','forty':'40','fifty':'50','sixty':'60','seventy':'70',
    'eighty':'80','ninety':'90','hundred':'100','thousand':'1000','million':'1000000',
  };

  // Hindi Romanized (typed in English script)
  const hindiRomanized: Record<string, string> = {
    'vn':'1','टू':'2','थ्री':'3','फोर':'4','फाइव':'5','सिक्स':'6',
    'सेवन':'7','एट':'8','नाइन':'9','टेन':'10','ट्वेंटी':'20',
    'ek':'1','do':'2','teen':'3','char':'4','paanch':'5','chhe':'6',
    'saat':'7','aath':'8','nau':'9','das':'10',
  };

  // Apply all number word replacements (longest first to avoid partial matches)
  const allNumWords = { ...englishNums, ...marathiNums, ...hindiNums, ...hindiRomanized };
  const sortedWords = Object.keys(allNumWords).sort((a,b) => b.length - a.length);
  for (const word of sortedWords) {
    t = t.replace(new RegExp(`\\b${word}\\b`, 'gi'), allNumWords[word]);
  }

  // ─── OPERATOR MAPPING ───
  // IMPORTANT: Map operators AFTER number words to avoid conflicts
  // e.g. Hindi "और" means "plus/and" - must be mapped after "एक और एक" → "1 और 1"
  const ops: [RegExp, string][] = [
    // Marathi operators
    [/\bअधिक\b|\bजमा\b/g, '+'],
    [/\bवजा\b|\bवगळा\b|\bउणे\b/g, '-'],
    [/\bगुणिले\b|\bगुणले\b|\bगुणाकार\b/g, '*'],
    [/\bभागिले\b|\bभागले\b|\bभागाकार\b/g, '/'],
    // Hindi operators
    [/\bजोड़\b|\bजोड\b/g, '+'],
    [/\bऔर\b/g, '+'],   // Hindi "aur" = and/plus - KEY FIX
    [/\bघटा\b|\bघटाओ\b/g, '-'],
    [/\bगुणा\b|\bगुणे\b/g, '*'],
    [/\bभाग\b|\bबटा\b/g, '/'],
    // Transliterated
    [/\bप्लस\b/g, '+'], [/\bमाइनस\b/g, '-'], [/\bमल्टिप्लाय\b/g, '*'], [/\bडिवाइड\b/g, '/'],
    [/\bइनटू\b|\bइन्टू\b/g, '*'],
    [/\badhik\b/gi, '+'], [/\bvaja\b/gi, '-'], [/\bgunile\b|\bgunle\b/gi, '*'], [/\bbhagile\b/gi, '/'],
    // English operators
    [/\bplus\b/gi, '+'], [/\badd(?:ed)?\b/gi, '+'],
    [/\bminus\b/gi, '-'], [/\bsubtract(?:ed)?\b/gi, '-'],
    [/\btimes\b/gi, '*'], [/\bmultiplied by\b/gi, '*'], [/\bmultiply\b/gi, '*'], [/\binto\b/gi, '*'],
    [/\bdivided by\b/gi, '/'], [/\bdivide by\b/gi, '/'], [/\bover\b/gi, '/'],
    [/\bto the power of\b/gi, '^'], [/\bto the power\b/gi, '^'], [/\bpower\b/gi, '^'],
    [/\bsquare root of\b/gi, 'sqrt('], [/\broot of\b/gi, 'sqrt('],
    [/\bfactorial\b/gi, '!'], [/\bpercent of\b/gi, '/100*'], [/\bpercent\b/gi, '/100'],
    [/\bopen bracket\b/gi, '('], [/\bclose bracket\b/gi, ')'],
    [/\s+[xX]\s+/g, '*'], [/×/g, '*'], [/÷/g, '/'],
    // Remove filler words
    [/\bwhat is\b/gi, ''], [/\bcalculate\b/gi, ''], [/\bfind\b/gi, ''], [/\bsolve\b/gi, ''],
    [/\bthe answer(?:\s+to)?\b/gi, ''], [/\bequals?\b/gi, ''], [/\?/g, ''],
    // Marathi fillers
    [/\bआणि\b/g, '+'],  // "aani" in Marathi = and/plus
    [/\bकिती\b|\bकिती आहे\b/gi, ''],
    // Hindi fillers
    [/\bकितना\b|\bकितने\b|\bहोगा\b|\bहोता\b|\bकरो\b|\bबताओ\b/gi, ''],
  ];

  for (const [p, r] of ops) t = t.replace(p, r);

  t = t.replace(/\s+/g, ' ').trim();

  // Auto-close brackets
  const opens = (t.match(/\(/g) || []).length;
  const closes = (t.match(/\)/g) || []).length;
  for (let i = 0; i < opens - closes; i++) t += ')';
  t = t.replace(/[+\-*/^]\s*$/g, '').trim();
  t = t.replace(/^\s*[+*/^]\s*/g, '').trim(); // remove leading operator (not minus)

  if (!t) return { answer: 'Please say a complete calculation', display: '', speak: 'Please say a complete calculation' };

  try {
    const res = evaluate(t);
    const n = typeof res === 'number' ? res : Number(res);
    if (!isFinite(n)) return { answer: 'Math Error', display: '', speak: 'Math Error' };
    const ans = fmt(n);
    LAST_ANS = n;
    return { answer: ans, display: '', speak: `The answer is ${ans}` };
  } catch {
    // Retry with original input
    try {
      const res = evaluate(input);
      const n = typeof res === 'number' ? res : Number(res);
      if (!isFinite(n)) return { answer: 'Math Error', display: '', speak: 'Math Error' };
      const ans = fmt(n);
      LAST_ANS = n;
      return { answer: ans, display: '', speak: `The answer is ${ans}` };
    } catch {
      // Last resort: try to extract just numbers and operator
      const numOnly = t.replace(/[^0-9+\-*/.^()]/g, '').trim();
      if (numOnly && numOnly !== t) {
        try {
          const res = evaluate(numOnly);
          const n = typeof res === 'number' ? res : Number(res);
          if (isFinite(n)) {
            const ans = fmt(n);
            LAST_ANS = n;
            return { answer: ans, display: '', speak: `The answer is ${ans}` };
          }
        } catch {}
      }
      return { answer: `"${input.slice(0, 20)}" - समजले नाही`, display: '', speak: 'Could not understand. Please try again.' };
    }
  }
}

// WEBVIEW - WebSpeech API based voice recognition
const SPEECH_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body>
<script>
var rec=null, listening=false, waitTimer=null, finalText='';
function send(d){window.ReactNativeWebView.postMessage(JSON.stringify(d));}

function startNew(lang){
  if(rec){try{rec.abort();}catch(e){} rec=null;}
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){send({type:'error',message:'not_supported'});return;}
  rec=new SR();
  rec.lang=lang||'en-IN';
  rec.continuous=false;
  rec.interimResults=true;
  rec.maxAlternatives=3;

  rec.onresult=function(e){
    var interim='', final='';
    for(var i=0;i<e.results.length;i++){
      if(e.results[i].isFinal) final+=e.results[i][0].transcript;
      else interim+=e.results[i][0].transcript;
    }
    if(interim) send({type:'interim',transcript:(finalText+' '+interim).trim()});
    if(final){
      finalText=(finalText+' '+final).trim();
      send({type:'interim',transcript:finalText});
      if(waitTimer) clearTimeout(waitTimer);
      waitTimer=setTimeout(function(){
        if(finalText.trim()){
          send({type:'final',transcript:finalText});
          finalText='';
          if(listening) startNew(rec.lang);
        }
      },3500);
    }
  };

  rec.onerror=function(e){
    if(e.error==='no-speech'&&listening){
      setTimeout(function(){if(listening)startNew(rec?rec.lang:'en-IN');},300);
      return;
    }
    if(e.error!=='aborted'){listening=false;send({type:'error',message:e.error});}
  };

  rec.onend=function(){
    if(listening&&!waitTimer){
      setTimeout(function(){if(listening)startNew(rec?rec.lang:'en-IN');},300);
    }
  };

  try{rec.start();}catch(e){listening=false;send({type:'end'});}
}

function start(lang){
  listening=true; finalText='';
  if(waitTimer){clearTimeout(waitTimer);waitTimer=null;}
  send({type:'start'});
  startNew(lang);
}

function stop(){
  listening=false;
  if(waitTimer){clearTimeout(waitTimer);waitTimer=null;}
  if(finalText.trim()){send({type:'final',transcript:finalText});finalText='';}
  if(rec){try{rec.stop();}catch(e){}}
  setTimeout(function(){send({type:'end'});},300);
}
send({type:'ready'});
</script></body></html>`;

export default function VoicePage() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const { history, addHistory, loadHistory, clearHistory } = useVoiceHistoryStore();

  const [transcript, setTranscript] = useState('');
  const [liveText, setLiveText] = useState('');
  const [result, setResult] = useState('');
  const [resultDisplay, setResultDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [inputText, setInputText] = useState('');
  const [webviewReady, setWebviewReady] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'en-IN' | 'mr-IN' | 'hi-IN'>('en-IN');
  const [waitMsg, setWaitMsg] = useState('');

  const webviewRef = useRef<WebView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    if (isListening) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 600, useNativeDriver: true }),
      ])).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const onMsg = (event: any) => {
    try {
      const d = JSON.parse(event.nativeEvent.data);
      if (d.type === 'ready') { setWebviewReady(true); }
      else if (d.type === 'start') { setIsListening(true); setLiveText(''); setWaitMsg(''); }
      else if (d.type === 'interim') { setLiveText(d.transcript); setWaitMsg('⏱️ Processing in 3.5 seconds...'); }
      else if (d.type === 'final') { setWaitMsg(''); setLiveText(''); if (d.transcript?.trim()) processQuery(d.transcript.trim()); }
      else if (d.type === 'end') { setIsListening(false); setWaitMsg(''); }
      else if (d.type === 'error') {
        if (d.message !== 'no-speech' && d.message !== 'aborted') {
          setIsListening(false); setWaitMsg('');
          if (d.message === 'not_supported') setShowInputModal(true);
        }
      }
    } catch {}
  };

  const handleLangChange = (lang: 'en-IN' | 'mr-IN' | 'hi-IN') => {
    setSelectedLang(lang);
    if (isListening) {
      webviewRef.current?.injectJavaScript(`stop(); setTimeout(function(){start('${lang}');},600); true;`);
    }
  };

  const startListening = () => {
    if (!webviewReady) return;
    setResult(''); setResultDisplay(''); setTranscript('');
    webviewRef.current?.injectJavaScript(`start('${selectedLang}'); true;`);
  };

  const stopListening = () => {
    webviewRef.current?.injectJavaScript('stop(); true;');
  };

  const processQuery = async (text: string) => {
    setLoading(true); setTranscript(text); setResult(''); setResultDisplay('');
    try {
      const parts = text.split(/\b(?:then|after that|next|and then|नंतर|फिर)\b/i);
      if (parts.length > 1) {
        const lines: string[] = [], speaks: string[] = [];
        let last = '';
        for (const part of parts) {
          if (part.trim()) {
            const { answer, display, speak } = await ultimateParse(part.trim());
            lines.push(`${part.trim().slice(0, 25)}\n= ${display || answer}`);
            speaks.push(speak); last = answer;
          }
        }
        const combined = lines.join('\n─────\n');
        setResult(last); setResultDisplay(combined);
        addHistory(text, combined);
        if (await Speech.isSpeakingAsync()) await Speech.stop();
        Speech.speak(speaks.join('. Then '), { language: selectedLang, pitch: 1.0, rate: 0.85 });
      } else {
        const { answer, display, speak } = await ultimateParse(text);
        setResult(answer); setResultDisplay(display);
        addHistory(text, display || answer);
        if (await Speech.isSpeakingAsync()) await Speech.stop();

        // Human-like responses per language
        let humanSpeak = speak;

        if (answer.includes('समजले नाही') || answer.includes('Error') || answer.includes('Please say')) {
          // Error case - give helpful guidance
          if (selectedLang === 'mr-IN') {
            humanSpeak = 'मला समजले नाही. कृपया परत सांगा. उदाहरण: पाच अधिक तीन किंवा दहा गुणिले दोन.';
          } else if (selectedLang === 'hi-IN') {
            humanSpeak = 'समझ नहीं आया। कृपया फिर से बोलें। उदाहरण: पाँच जोड़ तीन या दस गुणा दो।';
          } else {
            humanSpeak = 'Could not understand. Please try again. Example: five plus three or ten times two.';
          }
        } else if (selectedLang === 'mr-IN') {
          const mrPhrases = [
            `उत्तर आहे ${answer}.`,
            `${answer} हे उत्तर आहे.`,
            `बघा, उत्तर ${answer} येते.`,
            `हो! उत्तर आहे ${answer}.`,
          ];
          humanSpeak = mrPhrases[Math.floor(Math.random() * mrPhrases.length)];
          if (display && (display.includes('GST') || display.includes('EMI') || display.includes('off'))) {
            humanSpeak = display.replace(/₹/g, 'रुपये ').replace(/\n/g, '. ') + '. झाले!';
          }
        } else if (selectedLang === 'hi-IN') {
          const hiPhrases = [
            `जवाब है ${answer}.`,
            `${answer} आया।`,
            `देखिए, जवाब ${answer} है।`,
            `हां! जवाब है ${answer}.`,
          ];
          humanSpeak = hiPhrases[Math.floor(Math.random() * hiPhrases.length)];
          if (display && (display.includes('GST') || display.includes('EMI') || display.includes('off'))) {
            humanSpeak = display.replace(/₹/g, 'रुपये ').replace(/\n/g, '. ') + '. हो गया!';
          }
        } else {
          const enPhrases = [
            `The answer is ${answer}. Hope that helps!`,
            `That comes out to ${answer}!`,
            `I got ${answer} for you!`,
            `${answer} is your answer.`,
          ];
          humanSpeak = enPhrases[Math.floor(Math.random() * enPhrases.length)];
        }

        Speech.speak(humanSpeak, { language: selectedLang, pitch: 1.05, rate: 0.82 });
      }
    } catch { setResult('Error. Please try again.'); }
    finally { setLoading(false); }
  };

  const fmtTime = (ts: number) => { const d = new Date(ts); return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`; };

  const langs = [
    { code: 'en-IN' as const, label: 'English', flag: '🇮🇳' },
    { code: 'mr-IN' as const, label: 'मराठी', flag: '🧡' },
    { code: 'hi-IN' as const, label: 'हिंदी', flag: '💙' },
  ];

  const examples = [
    { t: 'one plus two', l: '🔢 one plus two = 3' },
    { t: 'what is 10 plus 5 times 9', l: '🔢 10 + 5 × 9 = 55' },
    { t: 'GST 18 percent on 5000', l: '🧾 GST 18% on ₹5000' },
    { t: 'EMI for 5 lakh at 8 percent for 5 year', l: '🏦 EMI 5L@8% 5yr' },
    { t: '25 percent discount on 1200', l: '🏷️ 25% Discount ₹1200' },
    { t: 'split 1200 between 4 people', l: '👥 Split ₹1200 ÷ 4' },
    { t: 'sin 30', l: '📐 sin(30°) = 0.5' },
    { t: 'पाच अधिक तीन', l: '🧡 पाच + तीन = 8' },
    { t: 'पाच गुणिले तीन', l: '🧡 पाच × तीन = 15' },
    { t: 'एक और एक', l: '💙 एक + एक = 2' },
    { t: 'पाँच जोड़ तीन', l: '💙 पाँच + तीन = 8' },
    { t: '5 times 5 then 6 divided by 3', l: '🔀 5×5 then 6÷3' },
  ];

  return (
    <>
      <Stack.Screen options={{
        title: 'AI Voice Calculator',
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#FFFFFF',
        headerLeft: () => (<TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}><Ionicons name="arrow-back" size={24} color="#FFFFFF" /></TouchableOpacity>),
        headerRight: () => (<TouchableOpacity onPress={() => setShowHistory(true)} style={{ marginRight: 8 }}><Ionicons name="time-outline" size={24} color="#FFFFFF" /></TouchableOpacity>),
      }} />

      <View style={{ height: 0, width: 0, overflow: 'hidden' }}>
        <WebView ref={webviewRef} source={{ html: SPEECH_HTML }} onMessage={onMsg} javaScriptEnabled={true} mediaPlaybackRequiresUserAction={false} originWhitelist={['*']} style={{ height: 1, width: 1 }} />
      </View>

      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>

          {/* Language Selector */}
          <View style={styles.langRow}>
            {langs.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langBtn,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                  selectedLang === lang.code && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
                onPress={() => handleLangChange(lang.code)}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, { color: selectedLang === lang.code ? '#FFF' : theme.text }]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Voice Button */}
          <View style={styles.voiceSection}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.voiceButton, { backgroundColor: isListening ? '#F44336' : theme.primary }]}
                onPress={isListening ? stopListening : startListening}
                disabled={loading}
              >
                <Ionicons name={loading ? 'hourglass' : isListening ? 'stop' : 'mic'} size={64} color="#FFF" />
              </TouchableOpacity>
            </Animated.View>
            <Text style={[styles.voiceLabel, { color: theme.text }]}>
              {loading ? 'Calculating...' : isListening ? '🔴 Listening... Tap to stop' : 'Tap to speak'}
            </Text>
            {waitMsg
              ? <Text style={[styles.waitMsg, { color: theme.primary }]}>{waitMsg}</Text>
              : <Text style={[styles.voiceSubLabel, { color: theme.textSecondary }]}>
                  {langs.find(l => l.code === selectedLang)?.flag} {langs.find(l => l.code === selectedLang)?.label} • auto-process
                </Text>
            }
            <TouchableOpacity style={[styles.manualBtn, { borderColor: theme.primary }]} onPress={() => setShowInputModal(true)}>
              <Ionicons name="create-outline" size={16} color={theme.primary} />
              <Text style={[styles.manualBtnText, { color: theme.primary }]}>Type instead</Text>
            </TouchableOpacity>
          </View>

          {/* Live transcript */}
          {liveText ? (
            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.primary, borderWidth: 1.5 }]}>
              <Text style={[styles.cardTitle, { color: theme.primary }]}>🎤 Hearing:</Text>
              <Text style={[styles.cardContent, { color: theme.text }]}>{liveText}</Text>
            </View>
          ) : null}

          {/* Final transcript */}
          {transcript && !liveText ? (
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.primary }]}>You said:</Text>
              <Text style={[styles.cardContent, { color: theme.text }]}>{transcript}</Text>
            </View>
          ) : null}

          {/* Result */}
          {result ? (
            <View style={[styles.card, { backgroundColor: theme.primary }]}>
              <Text style={[styles.cardTitle, { color: '#FFC107' }]}>Answer:</Text>
              {resultDisplay
                ? <Text style={[styles.resultDisplay, { color: '#FFF' }]}>{resultDisplay}</Text>
                : <Text style={[styles.resultText, { color: '#FFF' }]}>{result}</Text>
              }
              <TouchableOpacity style={styles.speakBtn} onPress={() => {
                const spk = resultDisplay ? resultDisplay.replace(/₹/g, 'rupees ').replace(/\n/g, '. ') : `The answer is ${result}`;
                Speech.speak(spk, { language: selectedLang });
              }}>
                <Ionicons name="volume-high" size={16} color="#FFC107" />
                <Text style={styles.speakBtnText}>Speak again</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Examples */}
          <View style={styles.examplesSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Try these:</Text>
            {examples.map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.exampleCard, { backgroundColor: theme.surface }]}
                onPress={() => processQuery(ex.t)}
                disabled={loading || isListening}
              >
                <Text style={[styles.exampleText, { color: theme.text }]}>{ex.l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info */}
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <Ionicons name="information-circle" size={22} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: '600', marginBottom: 4 }}>Voice supports:</Text>
              <Text style={{ color: theme.textSecondary, fontSize: 12, lineHeight: 20 }}>
                🔢 "one plus two", "four plus five"{'\n'}
                🧡 मराठी: "पाच अधिक तीन", "दहा गुणिले दोन"{'\n'}
                💙 हिंदी: "एक और एक", "पाँच जोड़ तीन"{'\n'}
                📐 sin/cos/tan/log/sqrt{'\n'}
                🧾 GST • EMI • Discount • Split{'\n'}
                🔀 "5 times 5 then 6 divided by 3"
              </Text>
            </View>
          </View>

        </ScrollView>

        {/* Type Modal */}
        <Modal visible={showInputModal} transparent animationType="slide" onRequestClose={() => setShowInputModal(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Type Calculation</Text>
                <TouchableOpacity onPress={() => setShowInputModal(false)}>
                  <Ionicons name="close" size={28} color={theme.text} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="e.g. GST 18 percent on 5000"
                placeholderTextColor={theme.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                numberOfLines={3}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, { borderColor: theme.border, borderWidth: 1 }]} onPress={() => { setShowInputModal(false); setInputText(''); }}>
                  <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={async () => { if (inputText.trim()) { setShowInputModal(false); await processQuery(inputText.trim()); setInputText(''); } }}
                  disabled={!inputText.trim()}
                >
                  <Text style={[styles.buttonText, { color: '#FFF' }]}>Calculate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* History Modal */}
        <Modal visible={showHistory} transparent animationType="slide" onRequestClose={() => setShowHistory(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.surface, height: '75%' }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Voice History</Text>
                <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                  {history.length > 0 && <TouchableOpacity onPress={clearHistory}><Text style={{ color: '#F44336', fontWeight: '600' }}>Clear All</Text></TouchableOpacity>}
                  <TouchableOpacity onPress={() => setShowHistory(false)}><Ionicons name="close" size={26} color={theme.text} /></TouchableOpacity>
                </View>
              </View>
              {history.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="mic-outline" size={44} color={theme.textSecondary} />
                  <Text style={{ color: theme.textSecondary, marginTop: 8 }}>No history yet</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                  {history.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.histItem, { backgroundColor: theme.background }]}
                      onPress={() => { setTranscript(item.expression); setResult(item.result); setResultDisplay(''); setShowHistory(false); }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 2 }} numberOfLines={2}>{item.expression}</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }} numberOfLines={3}>= {item.result}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <Text style={{ fontSize: 11, color: theme.textSecondary }}>{fmtTime(item.timestamp)}</Text>
                        <TouchableOpacity onPress={() => Speech.speak(`The answer is ${item.result}`, { language: 'en-IN' })}>
                          <Ionicons name="volume-medium-outline" size={18} color={theme.primary} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, alignItems: 'center' },
  langRow: { flexDirection: 'row', gap: 8, marginBottom: 8, marginTop: 8, width: '100%' },
  langBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 10, borderRadius: 12, borderWidth: 1 },
  langFlag: { fontSize: 16 },
  langLabel: { fontSize: 13, fontWeight: '600' },
  voiceSection: { alignItems: 'center', marginVertical: 18 },
  voiceButton: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 10 },
  voiceLabel: { marginTop: 14, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  voiceSubLabel: { marginTop: 4, fontSize: 12, textAlign: 'center' },
  waitMsg: { marginTop: 6, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  manualBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  manualBtnText: { fontSize: 14, fontWeight: '600' },
  card: { width: '100%', padding: 16, borderRadius: 16, marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  cardContent: { fontSize: 15, lineHeight: 22 },
  resultText: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
  resultDisplay: { fontSize: 15, lineHeight: 26, fontWeight: '500' },
  speakBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  speakBtnText: { color: '#FFC107', fontSize: 13 },
  examplesSection: { width: '100%', marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 10 },
  exampleCard: { padding: 12, borderRadius: 12, marginBottom: 7 },
  exampleText: { fontSize: 13 },
  infoCard: { width: '100%', flexDirection: 'row', padding: 14, borderRadius: 12, marginTop: 12, gap: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 20, padding: 20, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  modalInput: { padding: 14, borderRadius: 12, fontSize: 15, minHeight: 90, textAlignVertical: 'top', borderWidth: 1 },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalButton: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600' },
  histItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 12, borderRadius: 10, marginBottom: 8, gap: 8 },
});