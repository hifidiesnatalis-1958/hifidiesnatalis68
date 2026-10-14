const nextConfig = {
  poweredByHeader: false,
  devIndicators:false,
  distDir:process.env.UI_TESTING==='1' ? '.next-ui' : '.next',
  async headers() {
    return [{source:'/:path*', headers:[
      {key:'X-Content-Type-Options',value:'nosniff'},
      {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
      {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
    ]}];
  },
};
export default nextConfig;
