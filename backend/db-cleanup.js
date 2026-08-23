const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanup() {
  const { data: courses } = await supabase.from('courses').select('id');
  
  for (const course of courses) {
    const { data: lessons } = await supabase.from('lessons').select('id, title, created_at, concepts(id)').eq('course_id', course.id);
    
    // Group by title
    const byTitle = {};
    for (const l of lessons) {
      if (!byTitle[l.title]) byTitle[l.title] = [];
      byTitle[l.title].push(l);
    }
    
    for (const title of Object.keys(byTitle)) {
      const list = byTitle[title];
      if (list.length > 1) {
        // Sort: prefer those with concepts, then by latest created_at
        list.sort((a, b) => {
          const aCount = a.concepts ? a.concepts.length : 0;
          const bCount = b.concepts ? b.concepts.length : 0;
          if (aCount !== bCount) return bCount - aCount;
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        // Keep the first one, delete the rest
        const toDelete = list.slice(1).map(l => l.id);
        if (toDelete.length > 0) {
          console.log(`Deleting duplicate lessons for "${title}":`, toDelete);
          await supabase.from('lessons').delete().in('id', toDelete);
        }
      }
    }
  }
  console.log("Cleanup complete");
}

cleanup();
