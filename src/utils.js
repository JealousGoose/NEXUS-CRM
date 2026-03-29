export const getWhatsAppLink = (phone, customMessage = "") => {
  if (!phone) return '#';
  let cleanPhone = phone.replace(/[^\d+]/g, ''); // Extract only numbers and +
  
  // Remove leading zero if present
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // If no + prefix, ensure it has the 977 country code for Nepal
  if (!cleanPhone.startsWith('+')) {
    if (!cleanPhone.startsWith('977')) {
      cleanPhone = '977' + cleanPhone;
    }
  }
  
  const baseLink = `https://wa.me/${cleanPhone.replace('+', '')}`;
  
  if (customMessage) {
    return `${baseLink}?text=${encodeURIComponent(customMessage)}`;
  }
  return baseLink;
};

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n');
  const results = [];
  
  if (lines.length === 0) return results;
  
  // We'll be robust. If the first line has headings, we might skip it.
  // We'll just assume they look for phone numbers to identify real leads.
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split carefully by comma, allowing quotes (basic parser)
    const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
    
    // Attempt to guess columns. Usually Name, Phone, Source
    // This is flexible. We just look for standard lengths.
    let name = "Unknown Lead";
    let phone = "";
    let source = "Imported List";
    
    // Very simple heuristic: Phone usually has numbers. Name is usually letters.
    columns.forEach(col => {
       if (col.replace(/[^\d]/g, '').length >= 7) {
          phone = col; // If it has 7+ digits, it's the phone
       } else if (col && col.length > 2 && name === "Unknown Lead" && !col.toLowerCase().includes('phone')) {
          name = col; // If we found something meaty first that isn't the word "phone"
       } else if (col && col.length > 2 && source === "Imported List") {
          source = col;
       }
    });

    if (phone && phone.toLowerCase() !== 'phone') {
      results.push({
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random(),
        name: name,
        phone: phone,
        source: source,
        status: 'Interested', // Default for new leads
        rating: 3,
        needs: '',
        logs: [],
        createdAt: new Date().toISOString()
      });
    }
  }
  
  return results;
};

export const getSmartMessage = (client) => {
  const companyContext = client.companyName ? `at ${client.companyName}` : '';
  const industryContext = client.industry ? `for the ${client.industry} industry` : '';

  if (client.status === 'Meeting Booked') {
    return `Hi ${client.name}! This is Rafi from RevenueOrbits. Just confirming we are still on for our scheduled meeting? Looking forward to showing you what we can do ${companyContext}!`;
  }
  if (client.status === 'Interested') {
    return `Hi ${client.name}! This is Rafi. We spoke recently and you were incredibly interested in moving forward ${companyContext}. Do you have a few minutes today to chat about the exact next steps?`;
  }
  if (client.status === 'Follow up tomorrow' || client.status === 'Follow up later') {
    return `Hi ${client.name}! It's Rafi, following up as promised! Let me know when you have a free moment to reconnect.`;
  }
  
  // Cold Outreach default intelligently injecting available data
  if (client.companyName && client.industry) {
     return `Hey ${client.name}, this is Rafi from RevenueOrbits. We specialize in building automated client-generation engines ${industryContext}, and I noticed what you're doing ${companyContext}. Do you have a quick 5 minutes to chat this week?`;
  }
  if (client.companyName) {
     return `Hey ${client.name}, this is Rafi! I was checking out ${client.companyName} and I have a quick idea that could really help scale your operations right now. Do you have a quick 5 minutes today?`;
  }

  return `Hi ${client.name}, this is Rafi! I'm reaching out because I have a custom strategy that could really help you get more high-ticket clients consistently. Do you have a quick 5 minutes today?`;
};
