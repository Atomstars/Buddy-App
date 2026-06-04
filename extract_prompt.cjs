const fs=require('fs');
const lines=fs.readFileSync('C:/Users/Akash/.gemini/antigravity-ide/brain/3caa13aa-a8d3-48ad-b7d1-0187412bc186/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
for(let i=lines.length-1;i>=0;i--){
  if(lines[i].includes('"type":"USER_INPUT"')){
    console.log(JSON.parse(lines[i]).content);
    break;
  }
}
