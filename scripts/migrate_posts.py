import os
import glob
import re
import yaml

os.makedirs('src/content/blog/pt-br', exist_ok=True)
os.makedirs('src/content/blog/en', exist_ok=True)
os.makedirs('src/content/blog/es', exist_ok=True)

SPECIAL_MAP = {
    'instalacao-e-atualizacao-azure-arc-windows-configmgr': 'azure-arc-windows-configmgr',
    'install-update-azure-arc-windows-configmgr': 'azure-arc-windows-configmgr',
    'azure-sentinel-configuracao-do-log-forwarder': 'rsyslog-sentinel-log-forwarder',
    'rsyslog-sentinel-log-forwarder': 'rsyslog-sentinel-log-forwarder',
    'azure-arc-enabled-servers-configuracao-de-proxy-a-nivel-de-servico-em-linux': 'azure-arc-proxy-linux',
    'azure-arc-enabled-servers-service-level-proxy-configuration-on-linux': 'azure-arc-proxy-linux'
}

def get_translation_id(filename):
    base = os.path.splitext(os.path.basename(filename))[0]
    return SPECIAL_MAP.get(base, base)

def extract_excerpt(body, title):
    lines = body.strip().split('\n')
    for line in lines:
        line = line.strip()
        if not line or line.startswith('#') or line.startswith('<') or line.startswith('!') or line.startswith('```') or line.startswith('-'):
            continue
        clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', line)
        clean = re.sub(r'[*_`]', '', clean).strip()
        if len(clean) > 30:
            return clean[:160] + ('...' if len(clean) > 160 else '')
    return title

def migrate_file(filepath, target_lang):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    parts = content.split('---', 2)
    if len(parts) < 3:
        print(f'Skipping invalid {filepath}')
        return

    frontmatter = yaml.safe_load(parts[1]) or {}
    body = parts[2].strip()

    title = frontmatter.get('title', '')
    summary = str(frontmatter.get('summary', '') or '').strip()
    if not summary:
        summary = extract_excerpt(body, title)

    date_raw = frontmatter.get('date')
    if hasattr(date_raw, 'strftime'):
        pub_date = date_raw.strftime('%Y-%m-%d')
    else:
        pub_date = str(date_raw)[:10]

    updated_date = None
    if 'lastmod' in frontmatter and frontmatter['lastmod']:
        lastmod_raw = frontmatter['lastmod']
        if hasattr(lastmod_raw, 'strftime'):
            updated_date = lastmod_raw.strftime('%Y-%m-%d')
        else:
            updated_date = str(lastmod_raw)[:10]

    tags = frontmatter.get('tags', [])
    images = frontmatter.get('images', [])
    hero_image = images[0] if (images and isinstance(images, list) and len(images) > 0) else None

    trans_id = get_translation_id(filepath)
    draft = bool(frontmatter.get('draft', False))

    base_name = os.path.basename(filepath)
    target_path = os.path.join('src/content/blog', target_lang, base_name)

    new_fm = {
        'title': title,
        'description': summary,
        'pubDate': pub_date,
        'tags': tags,
        'translationId': trans_id,
        'draft': draft
    }
    if updated_date:
        new_fm['updatedDate'] = updated_date
    if hero_image:
        new_fm['heroImage'] = hero_image

    fm_str = yaml.dump(new_fm, allow_unicode=True, sort_keys=False)
    new_content = f'---\n{fm_str}---\n\n{body}\n'

    with open(target_path, 'w', encoding='utf-8') as out_f:
        out_f.write(new_content)

def main():
    pt_files = glob.glob('data/blog/pt-BR/**/*.mdx', recursive=True)
    for f in pt_files:
        migrate_file(f, 'pt-br')

    en_files = glob.glob('data/blog/en-US/**/*.mdx', recursive=True)
    for f in en_files:
        migrate_file(f, 'en')

    print(f'Successfully migrated {len(pt_files)} PT-BR posts and {len(en_files)} EN posts.')

if __name__ == '__main__':
    main()

