<template>
  <main class="dmca-page">
    <Headers /> 
    <section class="content-wrap">
      <div class="dmca-container">
        <h1>DMCA Policy</h1>
        <p>
          respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond expeditiously to notices of alleged copyright infringement.
        </p>

        <h2>Notice and Takedown Procedure</h2>
        <p>
          If you are a copyright owner or an agent thereof, and you believe that any content hosted on our website infringes your copyrights, you may submit a notification pursuant to the DMCA by providing our Designated Copyright Agent with the following information in writing:
        </p>
        <ul>
          <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
          <li>Identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works at a single online site are covered by a single notification, a representative list of such works at that site.</li>
          <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit the service provider to locate the material. Providing URLs in the body of an email is the best way to help us locate content quickly.</li>
          <li>Information reasonably sufficient to permit the service provider to contact the complaining party, such as an address, telephone number, and, if available, an electronic mail address at which the complaining party may be contacted.</li>
          <li>A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.</li>
          <li>A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
        </ul>

        <h2>Designated Copyright Agent</h2>
        <p>
          Notifications of claimed infringement should be sent to our Designated Copyright Agent at:
        </p>
        <p>
          <strong>[Your designated agent's name or department]</strong><br>
          <strong>[Your mailing address]</strong><br>
          <strong>[Your email address]</strong><br>
          <strong>[Your phone number (optional)]</strong>
        </p>
        <p>
          Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability.
        </p>

        <h2>Counter-Notification</h2>
        <p>
          If you believe that your material has been removed or disabled by mistake or misidentification, you may file a counter-notification with us by submitting the following information to our Designated Copyright Agent:
        </p>
        <ul>
           <li>Your physical or electronic signature.</li>
           <li>Identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or access to it was disabled.</li>
           <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification of the material to be removed or disabled.</li>
           <li>Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which the address is located (or if you are outside the United States, for any judicial district in which the service provider may be found), and that you will accept service of process from the person who provided the original notification or an agent of such person.</li>
        </ul>
        <p>
          Upon receipt of a valid counter-notification, we may restore the removed or disabled material in accordance with the DMCA.
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
/* 样式与 AboutView 类似，可以复用或调整 */
.dmca-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh; 
}

.content-wrap {
  flex-grow: 1; 
  padding: 40px 20px; 
  background-color: #f4f7f6; 
}

.dmca-container {
  max-width: 900px; 
  margin: 0 auto; 
  background-color: #fff; 
  padding: 30px 40px; 
  border-radius: 8px; 
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
}

.dmca-container h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.dmca-container h2 {
  color: #34495e;
  margin-top: 30px;
  margin-bottom: 15px;
  border-bottom: 2px solid #3498db; 
  padding-bottom: 5px;
}

.dmca-container p, .dmca-container ul {
  line-height: 1.8; 
  color: #555;
  margin-bottom: 15px;
}

.dmca-container ul {
  padding-left: 40px; /* 给列表添加缩进 */
}

.dmca-container li {
  margin-bottom: 10px; /* 列表项之间的间距 */
}
</style> 