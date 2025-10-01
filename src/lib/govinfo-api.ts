export class GovInfoAPI {
  private readonly API_KEY = 'WI9hQX86aSPojGmSu2C64FYRnBWe71v3EridMBg5';
  private readonly BASE_URL = 'https://api.govinfo.gov';
  
  constructor() {
    console.log('🔌 GovInfo API initialized');
  }

  async searchDocuments(query: string): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        api_key: this.API_KEY,
        query: query,
        pageSize: '100'
      });
      
      const response = await fetch(`${this.BASE_URL}/search?${params}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('GovInfo API error:', error);
      return [];
    }
  }

  async getCFRTitle(title: number): Promise<any> {
    try {
      const year = new Date().getFullYear();
      const url = `${this.BASE_URL}/collections/CFR/${year}/title-${title}?api_key=${this.API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`CFR Title ${title} not available`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch CFR Title ${title}:`, error);
      return null;
    }
  }
}