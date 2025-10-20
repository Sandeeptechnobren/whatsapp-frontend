// frontend/app/instances/page.tsx

"use client";
import CreateInstance from "../components/instancesConponent/createInstance";
import InstancesList from "../components/instancesConponent/instancesList";
import styles from "./instancesPage.module.css";

export default function InstancesPage() {
  return (
    <div className={styles.instancesContainer}>
      <div className={styles.leftPane}>
        <CreateInstance />
      </div>
      <div className={styles.rightPane}>
        <InstancesList />
      </div>
    </div>
  );
}
