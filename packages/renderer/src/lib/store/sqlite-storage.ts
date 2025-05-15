import { getAuthData, saveAuthData, clearAuthData } from '@/services/database';

// Custom storage engine for redux-persist using localForage
const localForageStorage = {
  async getItem(key: string) {
    if (key === 'persist:root') {
      try {
        const authData = await getAuthData();
        if (!authData) return null;
        
        // Format the data to match what redux-persist expects
        return JSON.stringify({
          auth: JSON.stringify({
            user: {
              username: authData.username,
              accessToken: authData.accessToken
            },
            status: 'succeeded',
            error: null
          })
        });
      } catch (error) {
        console.error('Error getting data from localForage', error);
        return null;
      }
    }
    return null;
  },
  
  async setItem(key: string, value: string) {
    if (key === 'persist:root') {
      try {
        const parsedData = JSON.parse(value);
        if (parsedData.auth) {
          const authData = JSON.parse(parsedData.auth);
          if (authData.user) {
            await saveAuthData(
              authData.user.username,
              authData.user.accessToken
            );
          }
        }
      } catch (error) {
        console.error('Error saving data to localForage', error);
      }
    }
  },
  
  async removeItem(key: string) {
    if (key === 'persist:root') {
      try {
        await clearAuthData();
      } catch (error) {
        console.error('Error removing data from localForage', error);
      }
    }
  }
};

export default localForageStorage; 