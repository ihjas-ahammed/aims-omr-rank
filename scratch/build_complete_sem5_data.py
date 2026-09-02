import pypdf, glob, os, re, json

def clean_text(s):
    if not s: return ""
    s = re.sub(r'Page\s+\d+\s+of\s+\d+', '', s)
    s = re.sub(r'CU\s*-\s*FYUGP\s*\|\s*BSc\.\s*[A-Z\s]+SYLLABUS\s*2024', '', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

def clean_module_name(name):
    # Remove 'Module I:', 'Module 1:', 'Module I', 'Module 1', 'I ', 'II ', etc.
    name = re.sub(r'^Module\s+[IVX0-9]+(?:\s*[:\-])?\s*', '', name, flags=re.I)
    name = re.sub(r'^[IVX]+\s*[:\-]\s*', '', name)
    name = re.sub(r'^\d+\s*[:\-]\s*', '', name)
    name = clean_text(name)
    # Remove trailing marks or hours
    name = re.sub(r'\s+(?:Hrs|Marks|Ext).*$', '', name, flags=re.I)
    return name.strip()

def parse_full_course(pdf_path, subject):
    reader = pypdf.PdfReader(pdf_path)
    full_text = '\n'.join([p.extract_text() or '' for p in reader.pages])
    fname = os.path.basename(pdf_path)

    # 1. Course Code & Title
    code = ""
    m_code = re.search(r'Course\s+Code\s+([A-Z0-9]+)', full_text, re.I)
    if m_code: code = m_code.group(1).strip()
    if not code:
        m_code = re.search(r'([A-Z]{3}[0-9][A-Z]{2}[0-9]{3})', fname)
        if m_code: code = m_code.group(1)

    # Manual overrides for accurate codes
    if 'QUANTUM_MECHANICS' in fname: code = 'PHY5CJ301'
    elif 'OPTICS' in fname: code = 'PHY5CJ302'
    elif 'ELECTRODYNAMICS' in fname: code = 'PHY4CJ203'
    elif 'MATERIALS_SCIENCE' in fname: code = 'PHY5EJ301'
    elif 'PROPERTIES_OF_SOLIDS' in fname: code = 'PHY5EJ302'
    elif 'PHOTONICS' in fname: code = 'PHY5EJ303'
    elif 'INTRODUCTORY_MOLECULAR_SPECTROSCOPY' in fname: code = 'PHY5EJ304'
    elif 'INTRODUCTORY_MEDICAL_PHYSICS' in fname: code = 'PHY5EJ305'
    elif 'PHYSICS_OF_THE_HUMAN_BODY' in fname: code = 'PHY5EJ306'
    elif 'FOUNDATIONS_OF_DATA_SCIENCE' in fname: code = 'PHY5EJ307'
    elif 'EXPLORATORY_DATA_ANALYSIS' in fname: code = 'PHY5EJ308'
    elif 'ASTROPHYSICS' in fname: code = 'PHY5EJ309'
    elif 'PYTHON_FOR_DATA_ANALYSIS' in fname: code = 'PHY5FS112'

    title = ""
    m_title = re.search(r'Course\s+Title\s+([^\n\r]+?)(?:Course\s+Code|Type\s+of\s+Course|Semester|$)', full_text, re.I)
    if m_title:
        title = clean_text(m_title.group(1))
    if not title or len(title) > 60:
        base = fname.replace('.pdf', '')
        base = re.sub(r'^[A-Z0-9_]+TypeofCourse[A-Za-z0-9_]*', '', base)
        base = re.sub(r'^[A-Z0-9]+_', '', base)
        title = base.replace('_', ' ').strip()

    ctype = 'elective'
    if 'CJ' in code or 'Core' in full_text[:1200] or 'Major Core' in full_text[:1200]:
        ctype = 'core'
    elif 'FS' in code or 'SEC' in full_text[:1200] or 'Skill Enhancement' in full_text[:1200]:
        ctype = 'sec'

    tb_match = re.search(r'Text\s*book[s]?\s*[:]?\s*([^\n\r]+(?:\n[^\n\r]+)?)', full_text, re.I)
    textbook = ""
    if tb_match:
        textbook = clean_text(tb_match.group(1))
        if 'Module' in textbook:
            textbook = textbook.split('Module')[0].strip()

    # Find syllabus text
    syl_idx = full_text.find('Detailed Syllabus')
    if syl_idx == -1: syl_idx = full_text.find('SYLLABUS')
    if syl_idx == -1: syl_idx = full_text.find('Module')
    syl_text = full_text[syl_idx:] if syl_idx != -1 else full_text

    # Extract Modules
    # Typical pattern in CU Syllabus:
    # "I Module I <Title> ... \n 1 Topic ... \n 2 Topic ... \n II Module II <Title> ..."
    # Or "Module Unit Content ... \n I <Title> ... \n 1 ... \n II <Title> ... \n 5 ..."
    
    # Split by Roman numerals at start of lines or preceding Module
    # Let's find all module headers
    mod_splits = re.split(r'\n\s*(?:(?:I|II|III|IV|V|VI)\s+(?:Module\s+[IVX0-9]+|Unit|[A-Z\s]{3,})|(?:Module\s+[IVX0-9]+))\b', syl_text, flags=re.I)
    
    # If regex split gave too few, try searching for "I ", "II ", "III ", "IV ", "V "
    # Let's inspect line by line for structured parsing
    lines = syl_text.splitlines()
    modules = []
    curr_mod = None
    curr_topics = []
    
    roman_map = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6}
    
    for line in lines:
        line_str = clean_text(line)
        if not line_str: continue
        
        # Check if this line is a Module Header
        mod_m = re.match(r'^(I|II|III|IV|V|VI)\s*(?:Module\s+[IVX0-9]+)?\s*[:\-]?\s*(.*)$', line_str, re.I)
        if not mod_m:
            mod_m = re.match(r'^Module\s+(I|II|III|IV|V|VI|[1-6])\s*[:\-]?\s*(.*)$', line_str, re.I)
        
        # Avoid matching roman numeral topics like "I. Introduction" if already in a module
        # But if it looks like a module header:
        is_mod_header = False
        mod_num = 1
        mod_title = ""
        
        if mod_m:
            r_str = mod_m.group(1).upper()
            if r_str in roman_map or r_str.isdigit():
                mod_num = roman_map.get(r_str, int(r_str) if r_str.isdigit() else len(modules) + 1)
                mod_title = clean_module_name(mod_m.group(2))
                # If mod_title is empty or just "Module II", give it a sensible name based on next lines or course
                is_mod_header = True
                
        # Also check for lines like "II FERMAT'S PRINCIPLE", "II INTERFERENCE", "III POLARIZATION"
        if not is_mod_header:
            caps_m = re.match(r'^(I|II|III|IV|V|VI)\s+([A-Z\s,–\-\(\)]{4,})$', line_str)
            if caps_m and 'PAGE' not in line_str and 'MARKS' not in line_str and 'HOURS' not in line_str:
                r_str = caps_m.group(1).upper()
                mod_num = roman_map[r_str]
                mod_title = clean_module_name(caps_m.group(2))
                is_mod_header = True

        if is_mod_header:
            if curr_mod:
                curr_mod['topics'] = curr_topics
                modules.append(curr_mod)
            curr_topics = []
            curr_mod = {
                'id': f"{code.lower()}_m{mod_num}",
                'number': mod_num,
                'title': mod_title if mod_title else f"Module {mod_num}",
                'topics': []
            }
            continue

        # If inside a module, check for topics
        if curr_mod:
            # Check if line is a numbered topic (e.g. "1 Section 2- Binary Operations (2.1 to 2.10)")
            top_m = re.match(r'^(\d+)\s*[\.\:\-]?\s+(.+)$', line_str)
            if top_m:
                u_num = top_m.group(1)
                t_title = clean_text(top_m.group(2))
                # Remove trailing hour / mark numbers like "2" or "3" at end of line
                t_title = re.sub(r'\s+\d+(?:\s+\d+)?$', '', t_title)
                t_title = re.sub(r'\s+Min\s*\.?\s*\d+.*$', '', t_title, flags=re.I)
                
                if len(t_title) > 3 and not re.match(r'^(?:Module|Unit|Content|Hrs|Marks|Ext)', t_title, re.I):
                    curr_topics.append({
                        'id': f"{curr_mod['id']}_t{u_num}",
                        'code': f"T{u_num}",
                        'title': t_title,
                        'unitNumber': int(u_num)
                    })
            else:
                # If topic continues on next line, append to previous topic title
                if curr_topics and len(line_str) > 2 and not line_str.startswith('Page') and not 'Marks' in line_str and not 'Textbook' in line_str:
                    # Check if line contains "Section X" or topic keywords
                    if 'Section' in line_str or 'Theorem' in line_str or 'Chapter' in line_str:
                        u_num = len(curr_topics) + 1
                        curr_topics.append({
                            'id': f"{curr_mod['id']}_t{u_num}",
                            'code': f"T{u_num}",
                            'title': line_str,
                            'unitNumber': u_num
                        })
                    elif len(curr_topics[-1]['title']) < 150:
                        curr_topics[-1]['title'] += f" {line_str}"

    if curr_mod:
        curr_mod['topics'] = curr_topics
        modules.append(curr_mod)

    return {
        'id': (code.lower() if code else title.lower().replace(' ', '_')),
        'code': code,
        'title': title,
        'subject': subject,
        'type': ctype,
        'textbook': textbook,
        'modules': modules
    }

print("Testing parser...")
m_parsed = [parse_full_course(f, 'mathematics') for f in math_files]
p_parsed = [parse_full_course(f, 'physics') for f in phy_files]

for c in m_parsed:
    print(f"MATH: {c['code']} - {c['title']} => {len(c['modules'])} Modules, {sum(len(m['topics']) for m in c['modules'])} Topics")
    for m in c['modules']:
        print(f"   Mod {m['number']}: '{m['title']}' ({len(m['topics'])} topics)")

print()
for c in p_parsed:
    print(f"PHY: {c['code']} - {c['title']} => {len(c['modules'])} Modules, {sum(len(m['topics']) for m in c['modules'])} Topics")
    for m in c['modules']:
        print(f"   Mod {m['number']}: '{m['title']}' ({len(m['topics'])} topics)")

