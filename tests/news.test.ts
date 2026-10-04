import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newsSources,verifiedReleases,newsBriefings} from '../src/lib/news';
test('News accepts only official stable releases within the observed 90-day window',()=>{
 const source=newsSources[0],now=new Date('2026-10-04T12:00:00Z');
 const good={name:'SDK fixture',tag_name:'v1.2.3',published_at:'2026-10-02T00:00:00Z',html_url:'https://github.com/openai/openai-python/releases/tag/v1.2.3',draft:false,prerelease:false};
 assert.equal(verifiedReleases([good],source,now).length,1);
 for(const changes of [{draft:true},{prerelease:true},{published_at:'2027-01-01'},{published_at:'2025-01-01'},{published_at:'invalid'},{html_url:'https://example.test/releases/tag/v1.2.3'},{html_url:'https://github.com/other/repo/releases/tag/v1.2.3'},{tag_name:'dev'},{html_url:'javascript:alert(1)'}]){
 assert.equal(verifiedReleases([{...good,...changes}],source,now).length,0);
 }
 assert.equal(verifiedReleases({},source,now).length,0);
 assert.ok(newsBriefings.every(b=>b.observed&&b.interpretation&&b.recommendation&&b.url.startsWith('https://github.com/')));
});
