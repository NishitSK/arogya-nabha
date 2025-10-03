# Render Deployment Guide

## Environment Variables to Set in Render Dashboard

Go to your Render service dashboard and add these environment variables:

### Required Environment Variables:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/arogyannabha
PORT=5000
JWT_SECRET=your_very_secure_production_jwt_secret_here
CLIENT_URL=https://your-frontend-domain.onrender.com
```

### Optional Environment Variables (if using these features):
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Render Service Configuration:

### Build Command:
```
npm install
```

### Start Command:
```
npm start
```

### Health Check Path:
```
/health
```

## Important Notes:

1. **Never commit .env.production to Git** - Render will use the environment variables you set in the dashboard
2. **MongoDB URI**: Use MongoDB Atlas connection string
3. **JWT_SECRET**: Generate a strong, unique secret for production
4. **CLIENT_URL**: Use your actual frontend domain on Render
5. **PORT**: Render automatically sets this, but you can override with 5000

## Security Recommendations:

- Use MongoDB Atlas with IP whitelisting
- Enable strong authentication on your MongoDB cluster
- Use a long, random JWT secret (at least 32 characters)
- Enable CORS only for your frontend domain
- Consider using Render's secrets for sensitive environment variables