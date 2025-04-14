<template>
  <main class="terms-page">
    <Headers /> 
    <section class="content-wrap">
      <div class="terms-container">
        <h1>Terms of Service</h1>
        <p>Last updated: [Date]</p>

        <p>
          Welcome to [Your Website Name]! These Terms of Service ("Terms") govern your access to and use of the [Your Website URL] website and the games and services offered thereon (collectively, the "Service"), operated by [Your Website Name] ("us", "we", or "our").
        </p>
        <p>
          Please read these Terms carefully before using our Service. Your access to and use of the Service is conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users and others who wish to access or use the Service.
        </p>
        <p>
          By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you do not have permission to access the Service.
        </p>

        <h2>Accounts (If Applicable)</h2>
        <p>
          When you create an account with us, you guarantee that you are above the age of 13, and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.
        </p>
        <p>
          You are responsible for maintaining the confidentiality of your account and password, including but not limited to the restriction of access to your computer and/or account. You agree to accept responsibility for any and all activities or actions that occur under your account and/or password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of [Your Website Name] and its licensors. The Service is protected by copyright, trademark, and other laws of both [Your Country] and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of [Your Website Name].
        </p>
        <p>
          The games available on the Service are the property of their respective owners or licensors and are protected by copyright laws. You are granted a limited, non-exclusive, non-transferable license to access and play the games solely for your personal, non-commercial use through the Service.
        </p>

        <h2>User Conduct</h2>
        <p>
          You agree not to use the Service:
        </p>
        <ul>
          <li>In any way that violates any applicable national or international law or regulation.</li>
          <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way by exposing them to inappropriate content or otherwise.</li>
          <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
          <li>To impersonate or attempt to impersonate [Your Website Name], a [Your Website Name] employee, another user, or any other person or entity.</li>
          <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm [Your Website Name] or users of the Service or expose them to liability.</li>
          <li>Use any robot, spider, or other automatic device, process, or means to access the Service for any purpose, including monitoring or copying any of the material on the Service.</li>
          <li>Introduce any viruses, trojan horses, worms, logic bombs, or other material which is malicious or technologically harmful.</li>
          <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of the Service, the server on which the Service is stored, or any server, computer, or database connected to the Service.</li>
        </ul>
        <p>
          (If comments or user-generated content are allowed): You are solely responsible for any content you submit or post to the Service. You agree not to post content that is unlawful, defamatory, obscene, threatening, invasive of privacy, infringing of intellectual property rights, or otherwise injurious to third parties.
        </p>
        
        <h2>Termination</h2>
        <p>
          We may terminate or suspend your access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
        </p>
        <p>
          All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
        </p>

        <h2>Disclaimer Of Warranties; Limitation Of Liability</h2>
        <p>
          The Service is provided on an "AS IS" and "AS AVAILABLE" basis. [Your Website Name] makes no representations or warranties of any kind, express or implied, as to the operation of their services, or the information, content or materials included therein. You expressly agree that your use of these services, their content, and any services or items obtained from us is at your sole risk.
        </p>
        <p>
          Neither [Your Website Name] nor any person associated with [Your Website Name] makes any warranty or representation with respect to the completeness, security, reliability, quality, accuracy, or availability of the services. Without limiting the foregoing, neither [Your Website Name] nor anyone associated with [Your Website Name] represents or warrants that the services, their content, or any services or items obtained through the services will be accurate, reliable, error-free, or uninterrupted, that defects will be corrected, that the services or the server that makes it available are free of viruses or other harmful components or that the services or any services or items obtained through the services will otherwise meet your needs or expectations.
        </p>
        <p>
          [Your Website Name] hereby disclaims all warranties of any kind, whether express or implied, statutory, or otherwise, including but not limited to any warranties of merchantability, non-infringement, and fitness for particular purpose.
        </p>
        <p>
          In no event will [Your Website Name], its affiliates or their licensors, service providers, employees, agents, officers or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the service, any websites linked to it, any content on the service or such other websites or any services or items obtained through the service or such other websites, including any direct, indirect, special, incidental, consequential, or punitive damages.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction, e.g., State/Country], without regard to its conflict of law provisions.
        </p>

        <h2>Changes To Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
        </p>
        <p>
          By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at [Your Contact Email].
        </p>
      </div>
    </section>
    <Footer />
  </main>
</template>

<script setup>
// 导入 Header 和 Footer 组件
import Headers from '../components/Head.vue' 
import Footer from '../components/foot.vue' 
</script>

<style scoped>
/* 样式与 AboutView/DmcaView 类似 */
.terms-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh; 
}

.content-wrap {
  flex-grow: 1; 
  padding: 40px 20px; 
  background-color: #f4f7f6; 
}

.terms-container {
  max-width: 900px; 
  margin: 0 auto; 
  background-color: #fff; 
  padding: 30px 40px; 
  border-radius: 8px; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
}

.terms-container h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.terms-container h2 {
  color: #34495e;
  margin-top: 30px;
  margin-bottom: 15px;
  border-bottom: 2px solid #3498db; 
  padding-bottom: 5px;
}

.terms-container p, .terms-container ul {
  line-height: 1.8; 
  color: #555;
  margin-bottom: 15px;
}

.terms-container ul {
  padding-left: 40px; 
}

.terms-container li {
  margin-bottom: 10px; 
}
</style> 