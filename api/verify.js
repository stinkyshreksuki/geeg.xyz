import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle GET request for key generation
  if (req.method === 'GET' && req.query.action === 'generate') {
    const randomKey = 'GEEG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error } = await supabase
      .from('keys')
      .insert([{ key_string: randomKey, hwid: null, used: false }]);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    return res.status(200).json({ success: true, key: randomKey });
  }

  // Handle POST request for key verification
  if (req.method === 'POST') {
    const { key, hwid } = req.body || {};

    if (!key) {
      return res.status(400).json({ success: false, message: 'Missing key.' });
    }

    const { data, error } = await supabase
      .from('keys')
      .select('*')
      .eq('key_string', key)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Invalid key.' });
    }

    if (data.used && data.hwid !== hwid) {
      return res.status(403).json({ success: false, message: 'Key already bound to another device.' });
    }

    await supabase
      .from('keys')
      .update({ hwid: hwid, used: true })
      .eq('key_string', key);

    return res.status(200).json({ success: true, message: 'Key verified successfully!' });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}
