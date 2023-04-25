# read md file and extract front matter and convert it into an object and return it

import re
import os
import yaml

dir_path = os.path.dirname(__file__)

def fix_markdown(file):
    with open(file, 'r') as f:
        md = f.read()

    # extract front matter and content
    frontmatter_match = re.search(r'^---\n(.*)\n---\n(.*)', md, re.DOTALL)
    frontmatter_text = frontmatter_match.group(1) if frontmatter_match else ''
    content_text = frontmatter_match.group(2) if frontmatter_match else ''
    
    frontmatter  = dict(yaml.load(frontmatter_text, Loader=yaml.FullLoader))

    # Rename file to yyyy-mm-dd-namespace-language.md
    new_name = dir_path + '/renamed/' + frontmatter['date'].strftime('%Y-%m-%d') + '-' + frontmatter['namespace'] + '-' + frontmatter['language'].split('-')[0] + '.md'
    with open(new_name, 'w') as f:
        f.write('---\n' + yaml.dump(frontmatter) + '---\n' + content_text)


def main():
    for subdir, dirs, files in os.walk(dir_path):
        for file in files:
            print(os.path.join(subdir, file))
            if file.endswith('.md'):
                fix_markdown(os.path.join(subdir, file))

if __name__ == '__main__':
    main()