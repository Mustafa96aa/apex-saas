/**
 * lib/team.js — ملخص الفريق/الشركة حسب نوع الحساب
 * kind: manager | owner | employee | none
 */
export async function getTeamOverview(sb, profile, detailed = false) {
  const type = profile.account_type;
  const nowIso = new Date().toISOString();

  // ── مدير: فريقه + أعضاؤه + المقاعد ──
  if (type === 'manager') {
    const { data: team } = await sb.from('teams').select('id,name,org_id')
      .eq('manager_id', profile.id).maybeSingle();
    if (!team) return { kind: 'manager', team: null, capacity: 0, members: [], invitations: [] };

    const { data: capacity } = await sb.rpc('team_capacity', { p_team: team.id });
    const { data: rows } = await sb.from('team_members')
      .select('user_id, joined_at, profiles(name,email)').eq('team_id', team.id);

    const out = {
      kind: 'manager',
      team: { id: team.id, name: team.name, in_org: !!team.org_id },
      capacity: capacity || 0,
      members: (rows || []).map(r => ({
        user_id: r.user_id, joined_at: r.joined_at,
        name: r.profiles?.name || '', email: r.profiles?.email || '',
      })),
      invitations: [],
    };
    if (detailed) {
      const { data: inv } = await sb.from('invitations')
        .select('id,code,email,expires_at,created_at')
        .eq('invited_by', profile.id).eq('kind', 'employee')
        .eq('status', 'pending').gt('expires_at', nowIso)
        .order('created_at', { ascending: false });
      out.invitations = inv || [];
    }
    return out;
  }

  // ── صاحب عمل: شركته + فرق مديريه ──
  if (type === 'owner') {
    const { data: org } = await sb.from('organizations').select('id,name')
      .eq('owner_id', profile.id).maybeSingle();
    if (!org) return { kind: 'owner', org: null, teams: [], invitations: [] };

    const { data: teams } = await sb.from('teams')
      .select('id,name,profiles(name,email)').eq('org_id', org.id);
    const ids = (teams || []).map(t => t.id);
    let counts = {};
    if (ids.length) {
      const { data: m } = await sb.from('team_members').select('team_id').in('team_id', ids);
      (m || []).forEach(r => { counts[r.team_id] = (counts[r.team_id] || 0) + 1; });
    }
    const out = {
      kind: 'owner',
      org,
      teams: (teams || []).map(t => ({
        id: t.id, name: t.name,
        manager_name: t.profiles?.name || '', manager_email: t.profiles?.email || '',
        members: counts[t.id] || 0,
      })),
      invitations: [],
    };
    if (detailed) {
      const { data: inv } = await sb.from('invitations')
        .select('id,code,email,expires_at,created_at')
        .eq('invited_by', profile.id).eq('kind', 'manager')
        .eq('status', 'pending').gt('expires_at', nowIso)
        .order('created_at', { ascending: false });
      out.invitations = inv || [];
    }
    return out;
  }

  // ── موظف: الفريق اللي انضم له ──
  if (type === 'employee') {
    const { data: m } = await sb.from('team_members')
      .select('team_id, teams(id,name,profiles(name))').eq('user_id', profile.id).maybeSingle();
    if (!m?.teams) return { kind: 'employee', team: null };
    return {
      kind: 'employee',
      team: { id: m.teams.id, name: m.teams.name, manager_name: m.teams.profiles?.name || '' },
    };
  }

  return { kind: 'none' };
}
