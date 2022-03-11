import { Component } from '@angular/core';
import { map } from 'rxjs';
import { colleague } from './Models/colleague';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Timezone-Scheduling-Assistant';
  colleagues:colleague[] = [];
  colleaguesConverted:colleague[] = [];
  groupAvailability:string[] = [];
  conversions = new Map<string, number>();
  nextTimes = new Map<string, string>();
  orderedTimes:string[] = ["0:00 am","0:30 am","1:00 am","1:30 am","2:00 am","2:30 am",
    "3:00 am","3:30 am","4:00 am","4:30 am","5:00 am","5:30 am","6:00 am","6:30 am",
    "7:00 am","7:30 am","8:00 am","8:30 am","9:00 am","9:30 am","10:00 am","10:30 am",
    "11:00 am","11:30 am","12:00 pm","12:30 pm","1:00 pm","1:30 pm","2:00 pm","2:30 pm",
    "3:00 pm","3:30 pm","4:00 pm","4:30 pm","5:00 pm","5:30 pm","6:00 pm","6:30 pm","7:00 pm",
    "7:30 pm","8:00 pm","8:30 pm","9:00 pm","9:30 pm","10:00 pm","10:30 pm","11:00 pm","11:30 pm",
  ];
  lastTimezone:string = "UTC";
  timezones:string[] = ["UTC","EST","EDT","CST","CDT","MST","MDT","PST","PDT"];
  selectedTimezone:any;
  disabled:boolean = true;
  mobile:boolean = false;
  buttonText:string[] = ["Add Colleagues", "Clear List", "Calculate Availability"];
  buttonTextMobile:string[] = ["Add", "Clear", "Calculate"];
  border:string = "";

  ngOnInit(){
    //assign conversion values
    this.setTimezoneConversions();
    this.setNextTimes();
    this.colleagues = [
      {name:"Ken", availability:"12:30 pm - 5:00 pm", timezone:"PST",modules:[]},
      {name:"Erin", availability:"11:00 am - 1:00 pm,2:00 pm - 6:00 pm", timezone:"CST",modules:[]},
      {name:"Susan", availability:"8:00 am - 12:00 pm,3:00 pm - 5:00 pm,6:00 pm - 8:00 pm", timezone:"EST",modules:[]}

    ];
    console.log("window width :" + window.innerWidth)
    if (window.innerWidth <= 500){
      this.mobile = true;
      this.buttonText = this.buttonTextMobile;
      this.border = "1px solid black";
    }
  }
  onChange(){
    this.convertGroupAvailability(this.lastTimezone, this.selectedTimezone);
    this.lastTimezone = this.selectedTimezone;
    this.disabled = true;
  }
  addColleague(){
    this.colleagues.push(new colleague)
  }
  clearList(){
    this.colleagues = [];
  }
  calculateAvailability(){
    this.colleaguesConverted = [];
    this.groupAvailability = [];
    this.selectedTimezone = "UTC";
    for(var i = 0; i < this.colleagues.length; i++){
      this.convertAvailability(this.colleagues[i].name, this.colleagues[i].availability, this.colleagues[i].timezone);
    }
    this.groupAvailability = this.getGroupAvailability();
    this.disabled = false; 
  }
  convertFromUTC(timezone:string){
    for (var i = 0 ; i < this.groupAvailability.length; i++){
      var split = this.groupAvailability[i].split("-");
      var a = this.convertOneFromUTC(split[0], timezone);
      var b = " - ";
      var c = this.convertOneFromUTC(split[1], timezone);
      this.groupAvailability[i] = a + b + c;
    }     
  }
  convertOneFromUTC(time:string, timezone:string):string{
    var a = time.trim();
    var conversionAmount = this.conversions.get(timezone);
    var aSplit = a.split(" ");
 
    var colonSplit = aSplit[0].split(":");
    var num = +colonSplit[0] - conversionAmount;
    if (num <= 0){
      console.log("ok, its happening")
      num += 12;
      colonSplit[0] = num.toString();
      aSplit[0] = colonSplit[0] + ":" + colonSplit[1];
      var suffix = aSplit[1] == "am" ? "pm" : "am";
      time = aSplit[0] + " " + suffix;
      return time;
    }else{
      colonSplit[0] = num.toString();
      aSplit[0] = colonSplit[0] + ":" + colonSplit[1];
      time = aSplit[0] + " " + aSplit[1];
      return time;
    }
  }
  convertToUTC(timezone:string){
    
  }
  convertOneToUTC(time:string, timezone:string):string{
    return ""
  }
  convertGroupAvailability(pFrom:string, pTo:string){
    if (pFrom == "UTC"){
      this.convertFromUTC(pTo);
    } else if(pTo == "UTC"){
      this.convertToUTC(pFrom);
    }else{
      this.convertToUTC(pFrom);
      this.convertFromUTC(pTo);
    }      
  }
  convertAvailability(pName:string, pAvailability:string, pTimezone:string){
    var avails = pAvailability.split(",");
    var zone = pTimezone;
    var newAvails:string = "";
    for (var i = 0; i < avails.length; i++){
      var splitAvailability:string[] = avails[i].split(" ");
      var time1 = splitAvailability[0].split(":");
      var time2 = splitAvailability[3].split(":");
  
      var conversionAmount = this.conversions.get(zone);
      if (+time1[0] == 12)
        time1[0] = "0";
      var num1 = (+time1[0] + conversionAmount);
      if (num1 >= 12){
        num1 -= 12;
        if(splitAvailability[1] == "am")
          splitAvailability[1] = "pm";
          else
            splitAvailability[1] = "am"                      
      }
      time1[0] = num1.toString();
      if (+time2[0] == 12)
        time2[0] = "0";
      var num2 = (+time2[0] + conversionAmount);
      if (num2 >= 12){
        num2 -= 12;
        if(splitAvailability[4] == "am")
          splitAvailability[4] = "pm";
          else
            splitAvailability[4] = "am"            
      }
      time2[0] = num2.toString();
      var from = time1[0] + ":" + time1[1];
      var to = time2[0] + ":" + time2[1];
      splitAvailability[0] = from;
      splitAvailability[3] = to;
      splitAvailability.forEach(e => {
        if (e == "am" || e == "pm")
          e = " " + e;
        if(e == "-")
          e = " " + e + " ";
        newAvails = newAvails.concat(e.toString());
      });
      if (i+1 < avails.length)
        newAvails = newAvails.concat(",");
    }
    
    var modules = this.getModules(newAvails);
    
    this.colleaguesConverted.push({name:pName, availability: newAvails, timezone: "UTC",modules:modules});
  }
  getGroupAvailability():string[]{
    
    var groupModules:string[] = [];
    
    //get array of all modules
    var allModules:string[] = [];
    for (var i = 0; i < this.colleaguesConverted.length; i++){
      //console.log("my modules")
      //console.log(this.colleaguesConverted[i].modules)
      allModules = allModules.concat(this.colleaguesConverted[i].modules);
    }
    //remove duplicates
    var uniqueModules = [...new Set(allModules)];
    //("unique modules")
    //console.log(uniqueModules)

    //sort unique modules
    var sortedModules:string[] = [];
    for(var i = 0; i < this.orderedTimes.length; i++){
      if (uniqueModules.includes(this.orderedTimes[i])){
        sortedModules.push(this.orderedTimes[i]);
      }
    }
  //console.log("sorted modules?")
  //console.log(sortedModules)


    //iterate through array
    //, if all colleagues modules contain an element, then push it to groupModules
    for(var i = 0; i < uniqueModules.length; i++){
      var groupModule:boolean = true;
      for(var j = 0; j < this.colleaguesConverted.length; j++){
        if(!this.colleaguesConverted[j].modules.includes(uniqueModules[i])){
          groupModule = false;
        }
      }
      if (groupModule){
        groupModules.push(uniqueModules[i]);
      }
    }
    
    //collect modules into 'blocks'
    var blocks:string[] = [];
    var a = groupModules[0];
    var b = " - ";
    var c = this.nextTimes.get(groupModules[0])
    for(var i = 1; i < groupModules.length; i++){
      if (groupModules.includes(c)){
        c = this.nextTimes.get(groupModules[i]);
      }else{
        blocks.push(a + b + c);
        a = groupModules[i];
        c = this.nextTimes.get(groupModules[i]);
      }
      if (i == groupModules.length - 1){
        blocks.push(a + b + c);
      }
    }
    //console.log("blocks")
    //console.log(blocks)
    return blocks;
  }
  getModules(pNewAvails:string):string[]{
    var modules:string[] = [];
    var avails = pNewAvails.split(",");
  for (var i = 0; i < avails.length; i++){
    var byDash = avails[i].split("-");
    var testModule = byDash[0].trim();
    var brakes = 0;
    while(testModule != byDash[1].trim()){
      modules.push(testModule);
      var newModule = this.nextTimes.get(testModule);
      testModule = newModule;
      if (brakes++ > 48) 
        break;
    }
      //console.log("avails")
      //console.log(avails)
      //console.log("correct modules?")
      //console.log(modules)
    }
    return modules;
  }
  setTimezoneConversions(){
    this.conversions.set("EDT",4);
    this.conversions.set("EST",5);
    this.conversions.set("CDT",5);
    this.conversions.set("CST",6);
    this.conversions.set("MDT",6);
    this.conversions.set("MST",7);
    this.conversions.set("PDT",7);
    this.conversions.set("PST",8);
  }
  setNextTimes(){
    this.nextTimes.set("0:00 am","0:30 am");
    this.nextTimes.set("0:30 am","1:00 am");
    this.nextTimes.set("1:00 am","1:30 am");
    this.nextTimes.set("1:30 am","2:00 am");
    this.nextTimes.set("2:00 am","2:30 am");
    this.nextTimes.set("2:30 am","3:00 am");
    this.nextTimes.set("3:00 am","3:30 am");
    this.nextTimes.set("3:30 am","4:00 am");
    this.nextTimes.set("4:00 am","4:30 am");
    this.nextTimes.set("4:30 am","5:00 am");
    this.nextTimes.set("5:00 am","5:30 am");
    this.nextTimes.set("5:30 am","6:00 am");
    this.nextTimes.set("6:00 am","6:30 am");
    this.nextTimes.set("6:30 am","7:00 am");
    this.nextTimes.set("7:00 am","7:30 am");
    this.nextTimes.set("7:30 am","8:00 am");
    this.nextTimes.set("8:00 am","8:30 am");
    this.nextTimes.set("8:30 am","9:00 am");
    this.nextTimes.set("9:00 am","9:30 am");
    this.nextTimes.set("9:30 am","10:00 am");
    this.nextTimes.set("10:00 am","10:30 am");
    this.nextTimes.set("10:30 am","11:00 am");
    this.nextTimes.set("11:00 am","11:30 am");
    this.nextTimes.set("11:30 am","12:00 pm");
    this.nextTimes.set("12:00 pm","12:30pm");
    this.nextTimes.set("12:30 pm","1:00 pm");
    this.nextTimes.set("1:00 pm", "1:30 pm");
    this.nextTimes.set("1:30 pm", "2:00 pm");
    this.nextTimes.set("2:00 pm","2:30 pm");
    this.nextTimes.set("2:30 pm","3:00 pm");
    this.nextTimes.set("3:00 pm","3:30 pm");
    this.nextTimes.set("3:30 pm","4:00 pm");
    this.nextTimes.set("4:00 pm","4:30 pm");
    this.nextTimes.set("4:30 pm","5:00 pm");
    this.nextTimes.set("5:00 pm","5:30 pm");
    this.nextTimes.set("5:30 pm","6:00 pm");
    this.nextTimes.set("6:00 pm","6:30 pm");
    this.nextTimes.set("6:30 pm","7:00 pm");
    this.nextTimes.set("7:00 pm","7:30 pm");
    this.nextTimes.set("7:30 pm","8:00 pm");
    this.nextTimes.set("8:00 pm","8:30 pm");
    this.nextTimes.set("8:30 pm","9:00 pm");
    this.nextTimes.set("9:00 pm","9:30 pm");
    this.nextTimes.set("9:30 pm","10:00 pm");
    this.nextTimes.set("10:00 pm","10:30 pm");
    this.nextTimes.set("10:30 pm","11:00 pm");
    this.nextTimes.set("11:00 pm","11:30 pm");
    this.nextTimes.set("11:30 pm","0:00 am");    
  }
}
