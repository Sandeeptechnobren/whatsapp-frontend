'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Instance {
  id: number;
  name: string;
  token: string;
  status: string;
}

export default function InstanceDetails() {
  const params = useParams();
  const id = params?.id;

  const [instance, setInstance] = useState<Instance | null>(null);

  useEffect(() => {
    fetchInstanceDetails();
  }, []);

  const fetchInstanceDetails = async () => {
    try {
        // const instanceDetails=async () => {
      console.log("Instance ID:", id);
      setInstance({
        id: Number(id),
        name: "Sample Instance",
        token: "abc123",
        status: "connected",
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (!instance) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h1>Instance Details</h1>

      <div style={{ marginTop: "20px" }}>
        <p><strong>ID:</strong> {instance.id}</p>
        <p><strong>Name:</strong> {instance.name}</p>
        <p><strong>Status:</strong> {instance.status}</p>
        <p><strong>Token:</strong> {instance.token}</p>
      </div>
    </div>
  );
}
// 'use client';

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { getInstanceDetails } from "../../allapis";

// export default function InstanceDetails() {
//   const params = useParams();
//     const id =
//     typeof params?.id === "string"
//       ? params.id
//       : Array.isArray(params?.id)
//       ? params.id[0]
//       : "";
//   const router = useRouter();
//   const [instance, setInstance] = useState<any>(null);

//   useEffect(() => {
//     fetchInstance();
//   }, []);

//   const fetchInstance = async () => {
//     const storedData = localStorage.getItem("admin");
//     if (!storedData) return;

//     const parsed = JSON.parse(storedData);
//     const token = parsed?.adminToken;

//     const res = await getInstanceDetails(token, id);

//     if (res.status === "pending") {
//       router.replace(`/instances/${id}/activate`);
//       return;
//     }

//     setInstance(res);
//   };

//   if (!instance) return <p>Loading...</p>;

//   return (
//     <div style={{ padding: 40 }}>
//       <h1>{instance.name}</h1>
//       <p>Status: {instance.status}



//       </p>
//       Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias neque quod illum quae laudantium sequi incidunt eveniet ipsa autem veniam dolorem unde debitis ratione, molestiae molestias hic commodi laboriosam vitae repellendus temporibus quam laborum necessitatibus accusamus! Dolorum ipsum sapiente expedita pariatur vero architecto suscipit hic. Repudiandae saepe magnam explicabo cumque voluptatum maxime in sint eligendi, minima deleniti? Quaerat nostrum reprehenderit placeat, obcaecati non deleniti quis laborum ipsa quos deserunt aut dolores consequatur amet autem. Ipsam reprehenderit at dignissimos repellendus rerum, necessitatibus odio eos porro. Temporibus atque distinctio blanditiis voluptate iusto illo quos veniam molestias animi? Sed doloremque, et illum fugit quasi cupiditate nisi praesentium delectus iure veniam error autem harum! Ea quo dicta, iure provident, asperiores laudantium placeat corrupti consectetur quidem perferendis quia sequi voluptatum necessitatibus accusamus consequatur dignissimos. Cupiditate ratione necessitatibus omnis et quam assumenda nesciunt molestiae veniam culpa mollitia ea quaerat, repellat, enim odit. Recusandae molestiae assumenda maiores exercitationem beatae impedit? Quaerat, delectus, quas veniam repellat pariatur sint laudantium suscipit, natus unde ipsum commodi. Enim pariatur quam eum optio, saepe nemo velit explicabo id magnam quibusdam culpa minima error ipsum, officiis ipsa commodi magni laborum facilis in illo dolorum? Quo, vel amet autem voluptatibus doloribus rem mollitia suscipit ullam laudantium, illum neque voluptas unde velit! Odit quasi debitis totam molestias nihil atque hic et maxime. Quisquam voluptatum, doloribus veritatis quo possimus nostrum blanditiis est sit accusamus cum doloremque unde vitae eaque sed enim rerum. Delectus sequi perspiciatis cumque suscipit laborum tenetur sint, deserunt veniam quod libero sit maxime quas rerum at asperiores atque numquam consequatur earum tempore aperiam! Sunt quas, dicta minus culpa suscipit alias eveniet reprehenderit, pariatur veritatis quasi placeat ratione illo corrupti fugiat repellat corporis, quidem iste rem recusandae odit assumenda. Tempora explicabo quaerat earum natus quod saepe fuga consectetur et officiis voluptatem voluptate ex dicta, neque corrupti beatae quo, at quidem vel! Quisquam minus corporis reprehenderit rem aperiam, libero asperiores consequatur vitae nisi amet? Quibusdam ipsam tempore laudantium provident rem incidunt quia eligendi veniam nesciunt similique non, perferendis atque! Et, quod! Accusamus, sapiente vitae. Omnis veritatis dolorum ullam non consequuntur quaerat nihil minima vel laborum. Velit minus quidem, quae id rem officia similique ratione reiciendis incidunt dicta provident a accusamus maxime eos veniam inventore voluptatibus, exercitationem ipsa esse iste quas. Vel, quam natus provident fuga odit pariatur est ducimus voluptates hic nobis, dolorem eveniet aliquid minima mollitia quia praesentium aliquam quas repellat quos eligendi aspernatur nesciunt perferendis obcaecati modi? Et, eum. Debitis quidem id illo, est laboriosam tenetur voluptatum quos obcaecati aperiam voluptates eveniet repudiandae nobis quaerat ab distinctio ullam, magnam dolor itaque necessitatibus quia fugiat unde aut! Minima consequatur exercitationem nemo perspiciatis repellendus corporis commodi, vel obcaecati. Libero suscipit esse doloremque nemo commodi? Laudantium magnam provident blanditiis soluta ea molestias nemo quibusdam amet architecto autem aut expedita ratione debitis quaerat ipsa corrupti, voluptate neque eligendi iusto fugit quia quam. Eaque repellat maiores, sit porro dolores voluptatum recusandae facilis blanditiis libero. Facilis vel, soluta laudantium reiciendis, repellendus ratione neque suscipit laborum quidem corporis, rerum temporibus praesentium assumenda! Nemo, facilis aperiam? Eaque illo eius corporis magni impedit voluptates expedita eveniet natus, placeat beatae consequuntur nam veritatis est et necessitatibus non molestiae velit! Magnam possimus dignissimos dolores quo, molestias perferendis iusto. Nisi obcaecati porro quam temporibus esse ducimus quaerat placeat eius tempore neque minus aperiam assumenda, veniam rerum, laboriosam officiis voluptates pariatur natus dolorem tenetur. Consequuntur eligendi pariatur officiis labore nemo laboriosam sed fuga deserunt, ullam nostrum maxime explicabo, nam molestiae, voluptatem iste. Ipsa et obcaecati veritatis voluptatum molestiae accusantium doloribus laboriosam eius cumque. Nobis similique quod vero corrupti tempora amet! Blanditiis est inventore, eius quisquam iure cupiditate mollitia repellat doloribus dolor nostrum omnis at tenetur natus perferendis autem atque tempora accusamus amet vitae corrupti nisi ipsum maiores? Adipisci corrupti consectetur sed impedit eius voluptatem natus hic quibusdam excepturi aut laborum amet id, reiciendis necessitatibus tenetur similique cupiditate! Quia pariatur expedita ducimus molestiae sequi, quod eum doloremque dolor suscipit illo sunt fugiat vitae asperiores consequatur quam? Saepe provident repudiandae sunt officia? Corrupti possimus blanditiis consequuntur quis perferendis ipsum inventore eaque incidunt, quam cumque numquam voluptatibus ex, amet natus magnam rerum sunt porro, vitae voluptatum. Quae possimus eius quas repudiandae quod repellendus soluta dolores officia ex. Quam ad similique repellendus ex omnis commodi nemo est doloremque vero autem magni, amet totam cum id tempore rerum ab fuga ullam accusamus sit! Necessitatibus voluptates rem vel at error iusto. Quisquam ut aliquid error harum ad beatae et maiores atque, maxime, culpa consectetur voluptatibus facilis excepturi animi laboriosam placeat doloribus vel nam voluptate amet totam eaque inventore deleniti! Facere, labore! Labore commodi, earum laudantium mollitia quod incidunt aspernatur quam doloribus facere? Odit, facilis nostrum. Nostrum ab iusto vel praesentium totam voluptatum, eos delectus recusandae eum quam labore ut tempora neque ipsa magnam sapiente corporis minima accusantium officiis odio. Qui similique vel, ipsa ab dicta dolore nesciunt hic aliquam vero accusantium blanditiis dolorem! Nisi, dolorum voluptatibus reiciendis possimus sapiente consequatur sunt, nostrum, quaerat temporibus odio cumque optio ad alias architecto autem doloremque consequuntur cum voluptatem. A, saepe incidunt. Non, illum dolore! Sit tempora quidem quis nulla eius, laboriosam repudiandae corporis officiis temporibus! Corporis et error earum possimus distinctio aliquid magni, eum delectus maiores architecto dolorum amet explicabo, nulla eos voluptatum dolores, odio necessitatibus consequuntur quidem asperiores quae sunt doloremque dignissimos ducimus. Laborum, quisquam. Similique libero expedita atque, soluta, id in tenetur accusantium voluptatibus distinctio ullam quia vitae omnis optio est, tempora suscipit! Aperiam, eum! Provident at iusto, odit voluptates necessitatibus hic amet labore culpa dolorum ullam, voluptatum vero placeat aut corrupti est! Dicta quaerat maxime voluptatem expedita officia eius accusantium sint saepe quasi, corporis sapiente nostrum cum quam, dolore eos aspernatur incidunt at praesentium. Debitis vitae quaerat, consequatur sunt corrupti accusamus sapiente quis ratione laboriosam cumque sit voluptate optio doloribus iusto eius inventore, hic unde voluptatem dicta, omnis alias? Sit labore nostrum et veniam ipsum perspiciatis optio, deserunt ut quo, voluptatibus dignissimos voluptate fuga. Corrupti facilis, praesentium placeat repellendus ipsum soluta veritatis libero cumque mollitia sapiente quas officia impedit minima deserunt? Repudiandae.
//     </div>
//   );
// }
