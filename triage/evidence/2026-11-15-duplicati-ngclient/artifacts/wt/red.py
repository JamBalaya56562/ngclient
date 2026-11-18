import sys
p, mode = sys.argv[1], sys.argv[2]
s = open(p, 'rb').read().decode()
if mode == 'schedule':
    a = s.index('                m_schedule = (m_schedule ?? [])\r\n                    .Where(x => x.Value.ID != sc.ID)')
    b = s.index('.ToArray();', a) + len('.ToArray();')
    s = s[:a] + s[b:]
elif mode == 'update':
    old = 'next > t.Value.Item2 ? next : t.Value.Item2'
    assert old in s; s = s.replace(old, 't.Value.Item2')
elif mode == 'cached':
    old = 'if (cached.Length > 0)'
    assert old in s; s = s.replace(old, 'if (false && cached.Length > 0)')
open(p, 'wb').write(s.encode())
