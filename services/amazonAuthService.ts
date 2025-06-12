import axios from 'axios';
import * as aws4 from 'aws4';

export class AmazonAuthService {
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly region: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly refreshToken: string;

  private accessToken: string | null = null;
  private accessTokenExpiry: number = 0;

  constructor() {
    this.accessKey = process.env.ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || '';
    this.secretKey = process.env.SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
    this.region = process.env.REGION || 'us-east-1';
    this.clientId = process.env.CLIENT_ID || '';
    this.clientSecret = process.env.CLIENT_SECRET || '';
    this.refreshToken = process.env.REFRESH_TOKEN || '';
  }

  private async fetchAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.accessTokenExpiry) {
      // Return cached token if still valid
      return this.accessToken;
    }

    const url = 'https://api.amazon.com/auth/o2/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', this.refreshToken);
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);

    try {
      const response = await axios.post(url, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      this.accessToken = response.data.access_token;
      // Set expiry 5 minutes earlier than actual to avoid edge cases
      this.accessTokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      if (!this.accessToken) {
        throw new Error('Access token is null');
      }

      return this.accessToken;
    } catch (error: any) {
      console.error('Failed to fetch Amazon access token:', error.response?.data || error.message);
      throw new Error('Failed to fetch Amazon access token');
    }
  }

  async createSignedHeaders(method: string, path: string, queryParams = ''): Promise<any> {
    const accessToken = await this.fetchAccessToken();

    const opts = {
      host: 'sellingpartnerapi-na.amazon.com',
      path: `${path}?${queryParams}`,
      method,
      service: 'execute-api',
      region: this.region,
      headers: {
        host: 'sellingpartnerapi-na.amazon.com',
        'x-amz-access-token': accessToken
      }
    };

    aws4.sign(opts, {
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretKey
    });

    return opts.headers;
  }
}