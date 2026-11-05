import { getProvinceForCity, ZIMBABWE_LOCATIONS } from '../data/zimbabweLocations';

export interface ParsedContact {
  id?: string;
  name: string;
  phone: string;
  whatsappNumber: string;
  city: string;
  province: string;
  subLocation: string;
  location: string;
  age: number;
  gender: 'female' | 'male';
  seeking: 'female' | 'male';
  intent: string;
  bio: string;
  photos: string[];
  notes?: string;
}

// Helper to sanitize phone number into Zimbabwean +263 format
export function formatZimbabwePhone(rawPhone: string): string {
  if (!rawPhone) return '+263 77 123 4567';
  let cleaned = rawPhone.replace(/[^\d+]/g, '').trim();
  if (cleaned.startsWith('00263')) {
    cleaned = '+' + cleaned.substring(2);
  } else if (cleaned.startsWith('263')) {
    cleaned = '+' + cleaned;
  } else if (cleaned.startsWith('07')) {
    cleaned = '+263' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+') && cleaned.length >= 9) {
    cleaned = '+263' + cleaned;
  }

  // Format nicely if +2637XXXXXXXX
  if (cleaned.startsWith('+263') && cleaned.length >= 12) {
    const code = cleaned.substring(0, 4);
    const prefix = cleaned.substring(4, 6);
    const mid = cleaned.substring(6, 9);
    const last = cleaned.substring(9);
    return `${code} ${prefix} ${mid} ${last}`.trim();
  }

  return cleaned || '+263 77 123 4567';
}

// Detect Zimbabwe City and matching Province
export function detectZimbabweCity(text: string): { city: string; province: string; subLocation: string } {
  const lower = (text || '').toLowerCase();
  for (const loc of ZIMBABWE_LOCATIONS) {
    if (lower.includes(loc.city.toLowerCase())) {
      const foundSub = loc.subLocations.find(s => lower.includes(s.toLowerCase())) || loc.subLocations[0] || 'Central';
      return {
        city: loc.city,
        province: loc.province,
        subLocation: foundSub
      };
    }
  }
  // Default to Harare
  return {
    city: 'Harare',
    province: 'Harare Metropolitan',
    subLocation: 'Borrowdale'
  };
}

// Detect age from birthday string or text mentions
export function detectAge(bdayStr?: string, text?: string): number {
  const currentYear = new Date().getFullYear();
  if (bdayStr) {
    const match = bdayStr.match(/(\d{4})/);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 1940 && year <= currentYear - 18) {
        return currentYear - year;
      }
    }
  }

  if (text) {
    // Look for patterns like "24 yrs", "age: 26", "28 years old", "25y/o"
    const match = text.match(/(?:age\s*[:=-]?\s*|(?:\b))([1-6][0-9])\s*(?:yrs|years\s*old|yo|y\/o|\b)/i);
    if (match) {
      const ageNum = parseInt(match[1], 10);
      if (ageNum >= 18 && ageNum <= 75) return ageNum;
    }
  }

  return 26; // Default standard dating age
}

// Detect Gender
export function detectGender(genderStr?: string, text?: string): 'female' | 'male' {
  const combined = `${genderStr || ''} ${text || ''}`.toLowerCase();
  if (
    combined.includes('female') ||
    combined.includes('woman') ||
    combined.includes('lady') ||
    combined.includes('girl') ||
    combined.includes('sister') ||
    genderStr?.trim().toUpperCase() === 'F'
  ) {
    return 'female';
  }
  if (
    combined.includes('male') ||
    combined.includes('man') ||
    combined.includes('guy') ||
    combined.includes('gentleman') ||
    genderStr?.trim().toUpperCase() === 'M'
  ) {
    return 'male';
  }
  return 'female';
}

// Detect Intent
export function detectIntent(text: string): string {
  const lower = (text || '').toLowerCase();
  if (lower.includes('marriage') || lower.includes('marry') || lower.includes('settle')) return 'Marriage';
  if (lower.includes('serious') || lower.includes('long term') || lower.includes('long-term')) return 'Long-term';
  if (lower.includes('dating') || lower.includes('romance')) return 'Dating';
  if (lower.includes('friend') || lower.includes('companion')) return 'Friendship';
  return 'Marriage';
}

// Parse Google vCard (.vcf)
export function parseVCardContent(vcfString: string): ParsedContact[] {
  const contacts: ParsedContact[] = [];
  const vcardRegex = /BEGIN:VCARD[\s\S]*?END:VCARD/gi;
  const blocks = vcfString.match(vcardRegex) || [];

  for (const block of blocks) {
    let name = '';
    let phone = '';
    let bday = '';
    let note = '';
    let address = '';
    let gender = '';
    let photo = '';

    const lines = block.split(/\r\n|\r|\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('FN:')) {
        name = line.substring(3).trim();
      } else if (!name && line.startsWith('N:')) {
        const parts = line.substring(2).split(';');
        name = [parts[1], parts[0]].filter(Boolean).join(' ').trim();
      } else if (!phone && line.startsWith('TEL')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) phone = line.substring(colonIdx + 1).trim();
      } else if (!bday && line.startsWith('BDAY:')) {
        bday = line.substring(5).trim();
      } else if (line.startsWith('NOTE:')) {
        note = line.substring(5).trim();
      } else if (line.startsWith('ADR')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) address = line.substring(colonIdx + 1).replace(/;/g, ' ').trim();
      } else if (line.startsWith('GENDER:')) {
        gender = line.substring(7).trim();
      } else if (line.startsWith('PHOTO') && line.includes('base64')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx !== -1) {
          const base64Data = line.substring(colonIdx + 1).trim();
          if (base64Data.length > 50) {
            photo = base64Data.startsWith('data:image') ? base64Data : `data:image/jpeg;base64,${base64Data}`;
          }
        }
      }
    }

    if (!name) continue;

    const locData = detectZimbabweCity(`${address} ${note}`);
    const detectedAge = detectAge(bday, note);
    const detectedGender = detectGender(gender, `${name} ${note}`);
    const intent = detectIntent(note);
    const cleanPhone = formatZimbabwePhone(phone);

    contacts.push({
      id: `google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.replace(/;/g, ' ').trim(),
      phone: cleanPhone,
      whatsappNumber: cleanPhone,
      city: locData.city,
      province: locData.province,
      subLocation: locData.subLocation,
      location: `${locData.city} (${locData.subLocation}), ${locData.province}, Zimbabwe`,
      age: detectedAge,
      gender: detectedGender,
      seeking: detectedGender === 'male' ? 'female' : 'male',
      intent,
      bio: note || `Hi, I am ${name}. Looking for a serious and respectful partner for ${intent.toLowerCase()}.`,
      photos: photo ? [photo] : [],
      notes: note
    });
  }

  return contacts;
}

// Parse Google CSV format or simple CSV
export function parseGoogleCSV(csvString: string): ParsedContact[] {
  const contacts: ParsedContact[] = [];
  const lines = csvString.split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return contacts;

  // Read header
  const header = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  
  // Find column indices
  const nameIdx = header.findIndex(h => h === 'name' || h === 'full name' || h === 'given name');
  const familyIdx = header.findIndex(h => h === 'family name' || h === 'last name');
  const phoneIdx = header.findIndex(h => h.includes('phone 1') || h === 'phone' || h === 'mobile' || h === 'whatsapp');
  const cityIdx = header.findIndex(h => h.includes('city') || h.includes('address') || h === 'location');
  const notesIdx = header.findIndex(h => h.includes('notes') || h === 'bio' || h === 'description');
  const bdayIdx = header.findIndex(h => h.includes('birthday') || h === 'bday' || h === 'age');
  const genderIdx = header.findIndex(h => h.includes('gender') || h === 'sex');

  // Simple CSV fallback if not Google Contacts CSV
  const isGeneric = nameIdx === -1 && lines.length > 0;

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i];
    if (!row.trim()) continue;

    // Split CSV respecting quotes
    const cols = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || row.split(',');
    const cleanCols = cols.map(c => c.replace(/^["']|["']$/g, '').trim());

    let name = '';
    let phone = '';
    let city = '';
    let note = '';
    let bdayOrAge = '';
    let gender = '';

    if (!isGeneric && nameIdx !== -1) {
      name = cleanCols[nameIdx] || '';
      if (familyIdx !== -1 && cleanCols[familyIdx]) {
        name = `${name} ${cleanCols[familyIdx]}`.trim();
      }
      phone = phoneIdx !== -1 ? cleanCols[phoneIdx] : '';
      city = cityIdx !== -1 ? cleanCols[cityIdx] : '';
      note = notesIdx !== -1 ? cleanCols[notesIdx] : '';
      bdayOrAge = bdayIdx !== -1 ? cleanCols[bdayIdx] : '';
      gender = genderIdx !== -1 ? cleanCols[genderIdx] : '';
    } else {
      // Positional fallback: Name, Phone, City, Age, Gender, Intent, Notes
      name = cleanCols[0] || '';
      phone = cleanCols[1] || '';
      city = cleanCols[2] || '';
      bdayOrAge = cleanCols[3] || '';
      gender = cleanCols[4] || '';
      note = cleanCols[5] || cleanCols[6] || '';
    }

    if (!name || name.toLowerCase() === 'name') continue;

    const locData = detectZimbabweCity(`${city} ${note}`);
    const detectedAge = detectAge(bdayOrAge, `${bdayOrAge} ${note}`);
    const detectedGender = detectGender(gender, `${name} ${note}`);
    const intent = detectIntent(note);
    const cleanPhone = formatZimbabwePhone(phone);

    contacts.push({
      id: `google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.replace(/;/g, ' ').trim(),
      phone: cleanPhone,
      whatsappNumber: cleanPhone,
      city: locData.city,
      province: locData.province,
      subLocation: locData.subLocation,
      location: `${locData.city} (${locData.subLocation}), ${locData.province}, Zimbabwe`,
      age: detectedAge,
      gender: detectedGender,
      seeking: detectedGender === 'male' ? 'female' : 'male',
      intent,
      bio: note || `Hi, I am ${name}. Looking for a genuine match for ${intent.toLowerCase()}.`,
      photos: [],
      notes: note
    });
  }

  return contacts;
}

// Master parsing function that detects vCard, CSV, or raw text input
export function parseGoogleContactData(rawInput: string): ParsedContact[] {
  const trimmed = rawInput.trim();
  if (trimmed.includes('BEGIN:VCARD')) {
    return parseVCardContent(trimmed);
  }
  if (trimmed.includes(',') || trimmed.includes('Name') || trimmed.includes('Phone')) {
    const res = parseGoogleCSV(trimmed);
    if (res.length > 0) return res;
  }

  // Raw lines or single contact input fallback
  const lines = trimmed.split(/\r\n|\r|\n/).filter(l => l.trim().length > 0);
  const contacts: ParsedContact[] = [];

  for (const line of lines) {
    // Check if line contains a phone number
    const phoneMatch = line.match(/(?:\+?263|07)[0-9\s-]{7,15}/);
    const phone = phoneMatch ? phoneMatch[0] : '';
    const withoutPhone = line.replace(phone, '').trim();
    
    // Extract first 2-3 words as name
    const tokens = withoutPhone.split(/[,;\t-]/).map(t => t.trim()).filter(Boolean);
    const name = tokens[0] || 'Single Member';
    const otherDetails = tokens.slice(1).join(' ');

    const locData = detectZimbabweCity(otherDetails);
    const detectedAge = detectAge(undefined, line);
    const detectedGender = detectGender(undefined, line);
    const intent = detectIntent(line);
    const cleanPhone = formatZimbabwePhone(phone);

    if (name.length >= 2) {
      contacts.push({
        id: `google_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name,
        phone: cleanPhone,
        whatsappNumber: cleanPhone,
        city: locData.city,
        province: locData.province,
        subLocation: locData.subLocation,
        location: `${locData.city} (${locData.subLocation}), ${locData.province}, Zimbabwe`,
        age: detectedAge,
        gender: detectedGender,
        seeking: detectedGender === 'male' ? 'female' : 'male',
        intent,
        bio: `Single from ${locData.city} looking for a genuine relationship.`,
        photos: []
      });
    }
  }

  return contacts;
}
