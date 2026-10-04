const expected=process.env.GITHUB_SHA;
if(!expected||!/^[a-f0-9]{40}$/.test(expected))throw new Error('Missing expected production commit.');
let ready=false;
for(let attempt=0;attempt<36;attempt++){
 try{const response=await fetch('https://kowi.one/api/health',{cache:'no-store',signal:AbortSignal.timeout(10000)});if(response.ok&&(await response.json()).commit===expected){ready=true;break;}}catch{}
 await new Promise(resolve=>setTimeout(resolve,5000));
}
if(!ready)throw new Error('Production did not serve the expected commit within the observation window.');
console.log('Production serves the expected commit. Starting verification.');
