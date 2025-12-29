"use client";

import Card from "../cards/Card";
import { useEffect, useState } from "react";

export default function Motivation({ userName }: { userName?: string }) {
  const quotes = [
    "Konsistensi kecil yang kamu jaga hari ini mungkin terlihat sepele, tapi justru itulah yang paling menentukan hasil jangka panjang. Setiap langkah rapi yang kamu lakukan akan mengurangi kesalahan di depan. Terus bergerak, meski perlahan, karena arah yang benar selalu lebih penting daripada kecepatan.",

    "Tidak masalah jika progres hari ini terasa pelan, selama kamu tetap fokus dan menyelesaikan apa yang sudah dimulai. Pekerjaan yang dikerjakan dengan tenang biasanya menghasilkan kualitas yang lebih stabil. Dari situlah rasa percaya diri akan tumbuh secara alami.",

    "Fokuslah pada satu tugas yang ada di depanmu sekarang, tanpa memikirkan terlalu jauh ke depan. Ketika satu pekerjaan selesai dengan baik, beban mental akan berkurang. Setelah itu, tugas berikutnya akan terasa jauh lebih ringan untuk dihadapi.",

    "Hari ini bukan tentang mengejar kesempurnaan, tapi tentang memastikan ada langkah nyata yang kamu ambil. Progres kecil yang konsisten akan jauh lebih terasa dampaknya dibanding usaha besar yang tidak berlanjut. Yang penting, kamu tidak berhenti bergerak.",

    "Kerja cerdas selalu berjalan beriringan dengan kerapian dan ketenangan. Ketika prosesnya rapi, pikiran juga akan lebih teratur. Dari sana, keputusan yang kamu ambil akan terasa lebih tepat dan minim kesalahan.",

    "Menjaga ritme kerja yang stabil akan membuat energi bertahan lebih lama sampai akhir shift. Kamu tidak perlu memaksakan diri terlalu keras di awal. Yang penting adalah menjaga konsistensi dari awal hingga selesai.",

    "Bekerja dengan tenang bukan berarti lambat, tapi berarti kamu memegang kendali penuh atas pekerjaanmu. Dengan pikiran yang jernih, kamu bisa melihat solusi lebih jelas. Kesalahan pun bisa diminimalkan sebelum terjadi.",

    "Satu tugas yang benar-benar selesai hari ini adalah pencapaian yang layak dihargai. Tidak perlu membandingkan progresmu dengan orang lain. Fokuslah pada apa yang bisa kamu selesaikan dengan baik saat ini.",

    "Kerapian dalam bekerja sering kali dianggap sepele, padahal dampaknya sangat besar. Proses yang rapi akan menghemat waktu di tahap berikutnya. Selain itu, hasil akhirnya juga akan lebih mudah dipertanggungjawabkan.",

    "Shift yang terasa lancar biasanya dimulai dari fokus pada hal-hal kecil. Ketika detail diperhatikan sejak awal, masalah besar bisa dihindari. Dari situlah rasa tenang dalam bekerja akan terbentuk.",

    "Kemampuan untuk tetap tenang di tengah kesibukan adalah skill yang sangat berharga. Dengan sikap tersebut, kamu bisa menjaga kualitas tanpa harus merasa terburu-buru. Hasil kerja pun akan terasa lebih konsisten.",

    "Sedikit demi sedikit, pekerjaan yang awalnya terasa berat akan mulai terasa lebih ringan. Yang penting kamu tidak berhenti di tengah jalan. Setiap langkah kecil tetap membawa kamu lebih dekat ke tujuan.",

    "Tenang dalam bekerja membantu kamu membuat keputusan yang lebih matang. Saat emosi tidak mengambil alih, logika bisa berjalan dengan lebih baik. Dari situ, hasil kerja akan terasa lebih solid.",

    "Progres hari ini, sekecil apa pun, adalah investasi untuk hari berikutnya. Apa yang kamu kerjakan sekarang akan mempengaruhi kelancaran kerja esok hari. Jadi, lakukan dengan penuh kesadaran.",

    "Daripada mengejar cepat namun penuh kesalahan, lebih baik bekerja dengan ritme yang stabil. Kecepatan akan datang dengan sendirinya seiring terbentuknya kebiasaan yang rapi. Fokuslah pada proses yang benar.",

    "Fokus pada satu hal akan membantu kamu menghemat energi mental. Ketika pikiran tidak terbagi, kualitas kerja meningkat. Dari sana, kepuasan terhadap hasil kerja pun akan muncul.",

    "Bekerja rapi sejak awal akan mengurangi revisi dan perbaikan di akhir. Hal ini membuat waktu kerja terasa lebih efisien. Selain itu, kamu juga bisa menyelesaikan shift dengan lebih tenang.",

    "Hari ini cukup kamu jalani dengan baik, tanpa perlu berlebihan. Tidak semua hari harus spektakuler untuk berarti. Konsistensi dalam menjalani rutinitas adalah kunci keberlanjutan.",

    "Kerja fokus akan membuat waktu terasa berjalan lebih cepat dari yang kamu kira. Saat pikiran selaras dengan pekerjaan, kelelahan mental berkurang. Dari situlah performa bisa dijaga lebih lama.",

    "Yang terpenting bukan seberapa cepat kamu menyelesaikan pekerjaan, tapi seberapa benar kamu melakukannya. Hasil yang baik selalu datang dari proses yang terjaga. Teruslah bekerja dengan arah yang jelas.",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * quotes.length);
        } while (next === prev); // cegah quote sama muncul lagi

        return next;
      });
    }, 10000); // ganti setiap 10 detik

    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <Card className="h-full">
      <h2 className="text-lg font-semibold  font-[Poppins]">🔥 Motivasi Shift Hari Ini</h2>

      <div className="flex mt-5 h-full">
        <p className="text-xl text-gray-700 leading-relaxed font-[Poppins] transition-opacity duration-500">
          <span className="font-semibold">{userName ? `${userName}, ` : ""}</span>
          <span className="italic">“{quotes[index]}”</span>
        </p>
      </div>
    </Card>
  );
}
