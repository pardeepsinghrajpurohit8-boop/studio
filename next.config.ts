
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
    
      // 1. अगर टाइपिंग की गलती हो, तो भी बिल्ड न रोकें
        typescript: {
            ignoreBuildErrors: true,
              },
                
                  // 2. अगर कोड में सफाई (Linting) की कमी हो, तो भी न रोकें
                    eslint: {
                        ignoreDuringBuilds: true,
                          },

                            // 3. इमेज एरर रोकने के लिए
                              images: {
                                  unoptimized: true,
                                    },
                                    };

                                    export default nextConfig;
                                    