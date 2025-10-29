import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('缺少 Supabase 服务端环境变量配置');
}

// 服务端客户端,拥有完全权限,绕过 RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
