class ActivityController{
 constructor(){this.reset()}
 reset(){this.source=null;this.seq=0;this.previous='idle';this.holdUntil=0;this.pendingUntil=0;this.sawBusy=false;this.inTurn=false}
 update(data,now=Date.now()){
  if(!data){this.reset();return 'idle'}
  if(this.source!==data.sourceKey){this.reset();this.source=data.sourceKey;this.seq=data.submission?.seq??0}
  const sent=data.submission,raw=['thinking','working'].includes(data.mode)?data.mode:'idle';
  const submitted=sent?.seq>this.seq&&sent.at>0&&now-sent.at>=0&&now-sent.at<8000;
  if(sent?.seq)this.seq=Math.max(this.seq,sent.seq);
  if(submitted){this.inTurn=true;this.sawBusy=false;this.holdUntil=now+900;this.pendingUntil=sent.at+12000}
  if(raw!=='idle'){
   if(this.previous==='idle'&&!this.inTurn)this.holdUntil=now+900;
   this.inTurn=true;this.sawBusy=true;this.pendingUntil=0;
  }else if(this.sawBusy){this.inTurn=false;this.pendingUntil=0}
  this.previous=raw;
  if(now<this.holdUntil)return 'thinking';
  if(raw!=='idle')return raw;
  if(this.inTurn&&!this.sawBusy&&now<this.pendingUntil)return 'thinking';
  this.inTurn=false;return 'idle';
 }
}
module.exports={ActivityController};
