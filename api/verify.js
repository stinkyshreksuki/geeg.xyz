import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://lzhtssljvxgojephvlrf.supabase.co', 'sb_publishable_CZNuUbLd4DLptpwVaZERHg_F9jM5-Hb');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { key, hwid } = req.body;
    if (!key || !hwid) return res.status(400).json({ success: false, message: "Missing data" });

    // Check if key exists in Supabase
    const { data, error } = await supabase.from('keys').select('*').eq('key_string', key).single();

    if (error || !data) {
        return res.json({ success: false, message: "Invalid key." });
    }

    // Check HWID locking
    if (data.hwid && data.hwid !== hwid) {
        return res.json({ success: false, message: "Key is locked to another device!" });
    }

    // Lock HWID if first time use
    if (!data.hwid) {
        await supabase.from('keys').update({ hwid: hwid, used: true }).eq('key_string', key);
    }

    // Return your heavy core script text here after successful verification!
    const protectedCoreScript = `print('geeg.xyz loaded successfully!')`; // Replace with your full obfuscated script later

    return res.json({ success: true, script: protectedCoreScript });
}