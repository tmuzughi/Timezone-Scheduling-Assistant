import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { map } from 'rxjs';
import { colleague } from './Models/colleague';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  tempName:string = "";
  tempStart:string = "9:00";
  tempStartMeridiem:string = "am";
  tempEnd:string = "5:00";
  tempEndMeridiem:string = "pm";
  tempAvailability:string[] = [];
  tempAvailabilityText:string = "No Availability Assigned";
  tempTimezone:string = "ET";
  teamAvailability:string[] = ["No Team Yet"];
  team:colleague[] = [];
  convertedTeam:colleague[] = [];
  results:string[] = ["No Results Yet"];







  title = 'Timezone-Scheduling-Assistant';
  colleagues:colleague[] = [];
  colleaguesConverted:colleague[] = [];
  groupAvailability:string[] = [];
  conversions = new Map<string, number>();
  nextTimes = new Map<string, string>();
  orderedTimes:string[] = ["12:00 am","12:30 am","1:00 am","1:30 am","2:00 am","2:30 am",
    "3:00 am","3:30 am","4:00 am","4:30 am","5:00 am","5:30 am","6:00 am","6:30 am",
    "7:00 am","7:30 am","8:00 am","8:30 am","9:00 am","9:30 am","10:00 am","10:30 am",
    "11:00 am","11:30 am","12:00 pm","12:30 pm","1:00 pm","1:30 pm","2:00 pm","2:30 pm",
    "3:00 pm","3:30 pm","4:00 pm","4:30 pm","5:00 pm","5:30 pm","6:00 pm","6:30 pm","7:00 pm",
    "7:30 pm","8:00 pm","8:30 pm","9:00 pm","9:30 pm","10:00 pm","10:30 pm","11:00 pm","11:30 pm",
  ];
  lastTimezone:string = "UTC";
  timezones:string[] = ["ET","CT","MT","PT","UTC"];
  selectedTimezone:any;
  disabled:boolean = true;
  mobile:boolean = false;
  buttonText:string[] = ["Add Availability", "Clear List", "Calculate Availability"];
  buttonTextMobile:string[] = ["Add", "Clear", "Calculate"];
  border:string = "1px solid lightgray";
  times:string[] = ["12:00","12:30","1:00","1:30","2:00","2:30",
  "3:00","3:30","4:00","4:30","5:00","5:30","6:00","6:30",
  "7:00","7:30","8:00","8:30","9:00","9:30","10:00","10:30",
  "11:00","11:30"];
  suffix:string[] = ["am","pm"]
  selectedSuffix:any;
  selectedTime:any;
 
constructor(private datePipe: DatePipe){

}
  ngOnInit(){
    //assign conversion values
    this.setTimezoneConversions();
    //this.setNextTimes();
    
    console.log("window width :" + window.innerWidth)
    if (window.innerWidth <= 500){
      this.mobile = true;
      this.buttonText = this.buttonTextMobile;
      //this.border = "1px solid black";
    }
  }
  saveColleague(){
    if (!this.isEmpty()){
      var avail = this.tempAvailability.join(",");
      var col:colleague = {name:this.tempName, availability: this.tempAvailability, timezone: this.tempTimezone, modules: []};
      this.team.push(col);
      this.clearForm();
      console.log(this.team);
    }
    else{
      console.log("itsa empty")
    }
    
  }
  clearForm(){
    this.tempName = "";
    this.tempAvailability = [];
    this.tempTimezone = "";
    this.tempStart = "9:00";
    this.tempStartMeridiem = "am";
    this.tempEnd = "5:00";
    this.tempEndMeridiem = "pm";
    this.tempTimezone = "ET";
    this.tempAvailabilityText = "No Availability Assigned";
  }
  isEmpty():boolean{
    if (this.tempName == "" || this.tempAvailability.length == 0)
      return true;
    return false;
  }
  onChange(){
    var test = this.getGroupAvailability();
    this.results = this.convertAvailabilityFromUTC(test, this.selectedTimezone);
    this.lastTimezone = this.selectedTimezone;
    this.disabled = true;
  }
  addAvailability(){
    this.tempAvailability.push(this.tempStart + " " + this.tempStartMeridiem + " - " + this.tempEnd + " " + this.tempEndMeridiem);
    this.tempAvailabilityText = this.tempAvailability.join(", ");
  }
  clearList(){
    this.colleagues = [];
  }
  calculateAvailability(){
    this.copy(this.team, this.convertedTeam);
    console.log(this.convertedTeam)
    //convert to UTC
    this.convertedTeam.forEach(e => {
      e.availability = this.convertAvailabilityToUTC(e.availability, e.timezone);
      e.modules = this.getModules(e.availability);
    });
    this.results = this.getGroupAvailability();
    //convert to ET
    this.results = this.convertAvailabilityFromUTC(this.results, "ET")
  }
  convertRoundTrip(pFrom:string, pTo:string){
    if (pFrom != pTo){

    }
  }
  convertAvailabilityFromUTC(pAvail:string[], pTo:string):string[]{
    var convertedAvail:string[] = [];
    var i = 0;
    pAvail.forEach(e => {
      var split = e.split("-");
      var from = split[0].trim();
      var to = split[1].trim();
      from = this.getConvertedTime(from, pTo, false);
      to = this.getConvertedTime(to, pTo, false);
      var newTime = from + " - " + to;
      convertedAvail.push(newTime);
    });
    return convertedAvail;
  }
  getGroupAvailability():string[]{
    
    var groupModules:string[] = [];
    
    //get array of all modules
    var allModules:string[] = [];
    for (var i = 0; i < this.convertedTeam.length; i++){
      //console.log("my modules")
      //console.log(this.colleaguesConverted[i].modules)
      allModules = allModules.concat(this.convertedTeam[i].modules);
    }
    
    //remove duplicates
    var uniqueModules = [...new Set(allModules)];
    //("unique modules")
    console.log("unique modules")
    console.log(uniqueModules)
    //sort unique modules
    var sortedModules:string[] = [];
    for(var i = 0; i < this.orderedTimes.length; i++){
      if (uniqueModules.includes(this.orderedTimes[i])){
        sortedModules.push(this.orderedTimes[i]);
      }
    }
  console.log("sorted modules?")
  console.log(sortedModules)

    //iterate through array
    //, if all colleagues modules contain an element, then push it to groupModules
    for(var i = 0; i < uniqueModules.length; i++){
      var groupModule:boolean = true;
      for(var j = 0; j < this.convertedTeam.length; j++){
        if(!this.convertedTeam[j].modules.includes(uniqueModules[i])){
          groupModule = false;
        }
      }
      if (groupModule){
        groupModules.push(uniqueModules[i]);
      }
    }
    console.log("group modules")
    console.log(groupModules)
    //collect modules into 'blocks'
    var blocks:string[] = [];
    var a = groupModules[0];
    var b = " - ";
    var c = this.orderedTimes[this.orderedTimes.indexOf(groupModules[0]) + 1];
    for(var i = 1; i < groupModules.length; i++){
      if (groupModules.includes(c)){
        c = this.orderedTimes[this.orderedTimes.indexOf(groupModules[i]) + 1];
      }else{
        blocks.push(a + b + c);
        a = groupModules[i];
        c = this.orderedTimes[this.orderedTimes.indexOf(groupModules[i]) + 1];
      }
      if (i == groupModules.length - 1){
        blocks.push(a + b + c);
      }
    }
    if (groupModules.length == 1){
      blocks.push(groupModules[0] + " - " + this.orderedTimes[this.orderedTimes.indexOf(groupModules[0]) + 1]);
    }
    if (groupModules.length == 0){
      blocks.push("No Availaiblity Found")
    }
    //console.log("blocks")
    //console.log(blocks)
    return blocks;
  }

  getModules(pAvail:string[]):string[]{
    var modules:string[] = [];
    pAvail.forEach(e => {
      var split = e.split("-");
      var from = split[0].trim();
      var to = split[1].trim();
      var add:boolean = false;
      this.orderedTimes.forEach(e => {
        if (e == from)
          add = true;
        if (add){
          if (e == to)
            add = false;
          else
          modules.push(e);
        }
      });
    });
    return modules;
  }
  convertAvailabilityToUTC(pAvail:string[], pFrom:string):string[]{
    var convertedAvail:string[] = [];
    var i = 0;
    pAvail.forEach(e => {
      var split = e.split("-");
      var from = split[0].trim();
      var to = split[1].trim();
      from = this.getConvertedTime(from, pFrom, true);
      to = this.getConvertedTime(to, pFrom, true);
      var newTime = from + " - " + to;
      convertedAvail.push(newTime);
    });
    return convertedAvail;
  }
  getConvertedTime(pTime:string ,pTimezone:string, pToUTC:boolean):string{
    //converting to UTC
    var convertAmount = this.conversions.get(pTimezone);
    //get index of time
    var index = this.orderedTimes.indexOf(pTime);
    //increase index by conversionAmount
    if (pToUTC){
      index += (convertAmount * 2);
      if (index >= this.orderedTimes.length){
        index = index - this.orderedTimes.length
      }
    }else{
      index -= (convertAmount * 2);
      if (index < 0){
        index = index + this.orderedTimes.length
      }
    }   
    //assign results
    return this.orderedTimes[index];
  }
  copy(source, destination){
    source.forEach(element => {
      destination.push({name: element.name, availability: element.availability, timezone: element.timezone, modules: []});
    });
  }
  setTimezoneConversions(){
    var currentDate = new Date();
    var formattedDate =  this.datePipe.transform(currentDate, 'MM');
    var num = +formattedDate;
    //not going to bother with daylight savings right now
    /*
    this.conversions.set("EDT",4);
    this.conversions.set("EST",5);
    this.conversions.set("CDT",5);
    this.conversions.set("CST",6);
    this.conversions.set("MDT",6);
    this.conversions.set("MST",7);
    this.conversions.set("PDT",7);
    this.conversions.set("PST",8);
    */
    this.conversions.set("ET",4);
    this.conversions.set("CT",5);
    this.conversions.set("MT",6);
    this.conversions.set("PT",7);
  }
  
}


